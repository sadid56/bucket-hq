"use client";

import React from "react";
import { Button, Box, Text, Flex, Spinner } from "@chakra-ui/react";

interface ImagePreviewModalProps {
  isOpen: boolean;
  title: string;
  imageUrl: string;
  isLoading?: boolean;
  onClose: () => void;
}

export function ImagePreviewModal({ isOpen, title, imageUrl, isLoading = false, onClose }: ImagePreviewModalProps) {
  if (!isOpen) return null;

  return (
    <Box
      position='fixed'
      inset={0}
      bg='rgba(0, 0, 0, 0.6)'
      backdropFilter='blur(6px)'
      display='flex'
      alignItems='center'
      justifyContent='center'
      zIndex={1500}
      onClick={onClose}
    >
      <Box
        bg='bg.panel'
        p={5}
        borderRadius='xl'
        borderWidth='1px'
        borderColor='border.subtle'
        shadow='2xl'
        width='90%'
        maxWidth='2xl'
        maxH='90vh'
        display='flex'
        flexDirection='column'
        gap={4}
        onClick={(e) => e.stopPropagation()}
      >
        <Flex align='center' justify='space-between' borderBottomWidth='1px' pb={2} borderColor='border.subtle'>
          <Text fontSize='md' fontWeight='bold' truncate maxW='70%'>
            {title}
          </Text>
          <Button size='xs' variant='ghost' onClick={onClose}>
            ✕
          </Button>
        </Flex>

        <Flex
          align='center'
          justify='center'
          flex='1'
          bg='blackAlpha.200'
          borderRadius='md'
          p={2}
          overflow='hidden'
          minH='250px'
          maxH='60vh'
        >
          {isLoading ? (
            <Spinner size='lg' color='teal.500' />
          ) : imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                borderRadius: "4px",
              }}
            />
          ) : (
            <Text color='fg.muted'>Preview Unavailable</Text>
          )}
        </Flex>

        <Flex justify='flex-end' gap={3} pt={2}>
          <Button size='sm' variant='outline' onClick={onClose}>
            Close
          </Button>
          {imageUrl && !isLoading && (
            <Button size='sm' colorPalette='teal' onClick={() => window.open(imageUrl, "_blank")}>
              Open in New Tab
            </Button>
          )}
        </Flex>
      </Box>
    </Box>
  );
}
