"use client";

import React, { useMemo } from "react";
import {
  Flex,
  Box,
  Text,
  Button,
  createListCollection,
  Spinner,
  type FlexProps,
} from "@chakra-ui/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  SelectRoot,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValueText,
} from "@/components/ui/select";

export interface PaginationProps extends Omit<FlexProps, "onChange" | "page"> {
  page: number;
  pageSize: number;
  totalItems?: number;
  currentCount?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  showItemCount?: boolean;
  showPageSizeSelector?: boolean;
  isServerSide?: boolean;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  isLoading?: boolean;
}

export function Pagination({
  page,
  pageSize,
  totalItems,
  currentCount,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [15, 25, 50, 100],
  showItemCount = true,
  showPageSizeSelector = true,
  isServerSide = false,
  hasNextPage,
  hasPreviousPage,
  isLoading = false,
  ...rest
}: PaginationProps) {
  const hasTotal = typeof totalItems === "number";
  const totalPages = hasTotal ? Math.max(1, Math.ceil(totalItems / pageSize)) : undefined;

  const countOnPage = currentCount ?? (hasTotal ? Math.min(pageSize, Math.max(0, totalItems - (page - 1) * pageSize)) : pageSize);
  const startItem = countOnPage === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = (page - 1) * pageSize + countOnPage;

  const canGoPrev = hasPreviousPage !== undefined ? hasPreviousPage : page > 1;
  const canGoNext = hasNextPage !== undefined ? hasNextPage : (totalPages ? page < totalPages : false);

  const pageSizeCollection = useMemo(() => {
    return createListCollection({
      items: pageSizeOptions.map((opt) => ({
        label: `${opt}`,
        value: String(opt),
      })),
    });
  }, [pageSizeOptions]);

  const handlePageSizeSelect = (details: { value: string[] }) => {
    if (details.value[0] && onPageSizeChange) {
      const newSize = Number(details.value[0]);
      onPageSizeChange(newSize);
    }
  };

  return (
    <Flex
      align="center"
      justify="space-between"
      wrap="wrap"
      gap={4}
      px={{ base: 3, md: 4 }}
      py={3}
      fontSize="xs"
      color="fg.muted"
      borderTopWidth="1px"
      borderColor="border.subtle"
      {...rest}
    >
      {/* Item count summary */}
      {showItemCount && (
        <Flex align="center" gap={2} fontSize="xs" color="fg.muted" userSelect="none">
          {isLoading && <Spinner size="inherit" color="teal.500" />}
          {countOnPage === 0 ? (
            <Text>0 items</Text>
          ) : hasTotal ? (
            <Text>
              Showing <Text as="span" fontWeight="semibold" color="fg">{startItem}</Text>
              {" - "}
              <Text as="span" fontWeight="semibold" color="fg">{Math.min(endItem, totalItems)}</Text>
              {" of "}
              <Text as="span" fontWeight="semibold" color="fg">{totalItems}</Text> items
            </Text>
          ) : (
            <Text>
              Showing <Text as="span" fontWeight="semibold" color="fg">{startItem}</Text>
              {" - "}
              <Text as="span" fontWeight="semibold" color="fg">{endItem}</Text> items
            </Text>
          )}
        </Flex>
      )}

      {/* Right controls: Page size selector + Page navigation */}
      <Flex align="center" gap={{ base: 3, sm: 4 }} ml="auto" wrap="wrap">
        {showPageSizeSelector && onPageSizeChange && (
          <Flex align="center" gap={2}>
            <Text fontSize="xs" color="fg.muted" whiteSpace="nowrap">
              Rows:
            </Text>
            <Box w="74px">
              <SelectRoot
                collection={pageSizeCollection}
                value={[String(pageSize)]}
                onValueChange={handlePageSizeSelect}
                size="xs"
              >
                <SelectTrigger>
                  <SelectValueText />
                </SelectTrigger>
                <SelectContent style={{ minWidth: "74px" }}>
                  {pageSizeCollection.items.map((opt) => (
                    <SelectItem item={opt} key={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectRoot>
            </Box>
          </Flex>
        )}

        {/* Previous & Next Buttons */}
        <Flex align="center" gap={1.5}>
          <Button
            size="xs"
            variant="outline"
            disabled={!canGoPrev || isLoading}
            onClick={() => onPageChange(Math.max(1, page - 1))}
            borderColor="border.subtle"
            _hover={{
              borderColor: "teal.500",
              color: "teal.400",
              bg: "rgba(49, 151, 149, 0.08)",
            }}
            gap={1}
            px={2.5}
            h="28px"
          >
            <ChevronLeft size={13} />
            <Text as="span" display={{ base: "none", sm: "inline" }}>
              Prev
            </Text>
          </Button>

          <Text
            px={2}
            fontSize="xs"
            fontWeight="medium"
            color="fg"
            userSelect="none"
            whiteSpace="nowrap"
          >
            {totalPages ? `${page} / ${totalPages}` : `Page ${page}`}
          </Text>

          <Button
            size="xs"
            variant="outline"
            disabled={!canGoNext || isLoading}
            onClick={() => onPageChange(page + 1)}
            borderColor="border.subtle"
            _hover={{
              borderColor: "teal.500",
              color: "teal.400",
              bg: "rgba(49, 151, 149, 0.08)",
            }}
            gap={1}
            px={2.5}
            h="28px"
          >
            <Text as="span" display={{ base: "none", sm: "inline" }}>
              Next
            </Text>
            <ChevronRight size={13} />
          </Button>
        </Flex>
      </Flex>
    </Flex>
  );
}
