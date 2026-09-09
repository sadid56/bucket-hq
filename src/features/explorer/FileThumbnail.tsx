"use client";

import React, { useEffect, useState, useRef } from "react";
import { Flex } from "@chakra-ui/react";
import { Image } from "lucide-react";

import { StorageItem } from "./types";

const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

function getCachedSignedUrl(connectionId: string, key: string): string | null {
  const cacheKey = `${connectionId}:${key}`;
  const cached = signedUrlCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }
  return null;
}

function setCachedSignedUrl(connectionId: string, key: string, url: string) {
  const cacheKey = `${connectionId}:${key}`;
  signedUrlCache.set(cacheKey, { url, expiresAt: Date.now() + 600 * 1000 });
}

class RequestQueue {
  private queue: (() => Promise<any>)[] = [];
  private processing = false;

  add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
      this.processNext();
    });
  }

  private async processNext() {
    if (this.processing || this.queue.length === 0) return;
    this.processing = true;

    const task = this.queue.shift();
    if (task) {
      try {
        await task();
      } catch (err) {}
      // Stagger requests by 150ms to prevent triggering the backend 429 rate limiter
      await new Promise((resolve) => setTimeout(resolve, 150));
    }

    this.processing = false;
    this.processNext();
  }
}

const signUrlQueue = new RequestQueue();

export function FileThumbnail({
  item,
  connectionId,
  getSigningMutation,
}: {
  item: StorageItem;
  connectionId: string;
  getSigningMutation: any;
}) {
  const [url, setUrl] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [visible, setVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const getSigningMutationRef = useRef(getSigningMutation);
  getSigningMutationRef.current = getSigningMutation;

  useEffect(() => {
    const cachedUrl = getCachedSignedUrl(connectionId, item.key);
    if (cachedUrl) {
      setUrl(cachedUrl);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "100px" }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [connectionId, item.key]);

  useEffect(() => {
    if (!visible) return;

    const cachedUrl = getCachedSignedUrl(connectionId, item.key);
    if (cachedUrl) {
      setUrl(cachedUrl);
      return;
    }

    let active = true;
    const fetchUrl = async () => {
      try {
        const res = await signUrlQueue.add<{ url: string }>(() =>
          getSigningMutationRef.current.mutateAsync({
            action: "download",
            connectionId,
            key: item.key,
          })
        );
        if (active) {
          setUrl(res.url);
          setCachedSignedUrl(connectionId, item.key, res.url);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchUrl();
    return () => {
      active = false;
    };
  }, [visible, item.key, connectionId]);

  return (
    <Flex
      ref={containerRef}
      align="center"
      justify="center"
      width="100%"
      height="100%"
      bg="bg.muted"
      position="relative"
      overflow="hidden"
      borderRadius="sm"
    >
      {!imageLoaded && <Image size={14} color="var(--chakra-colors-fg-muted)" />}

      {url && (
        <img
          src={url}
          alt={item.name}
          onLoad={() => setImageLoaded(true)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: imageLoaded ? 1 : 0,
            transition: "opacity 0.2s ease-in-out",
          }}
        />
      )}
    </Flex>
  );
}
