"use client"

import type { CollectionItem } from "@chakra-ui/react"
import { Select as ChakraSelect, Portal } from "@chakra-ui/react"
import { CloseButton } from "./close-button"
import * as React from "react"

interface SelectTriggerProps extends ChakraSelect.ControlProps {
  clearable?: boolean
}

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  SelectTriggerProps
>(function SelectTrigger(props, ref) {
  const { children, clearable, ...rest } = props
  return (
    <ChakraSelect.Control
      {...rest}
      css={{
        position: "relative",
        borderRadius: "md",
        "& [data-part=trigger]": {
          borderColor: "rgba(255, 255, 255, 0.28) !important",
          borderWidth: "1.5px !important",
          borderRadius: "md",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        },
        "&:hover [data-part=trigger]": {
          borderColor: "rgba(255, 255, 255, 0.5) !important",
        },
        "&[data-state=open] [data-part=trigger]": {
          borderColor: "var(--chakra-colors-teal-400, #38b2ac) !important",
          boxShadow: "0 0 0 1px var(--chakra-colors-teal-400, #38b2ac), 0 0 12px rgba(56, 178, 172, 0.35) !important",
        },
        "&[data-state=open] [data-part=indicator]": {
          transform: "rotate(180deg)",
          color: "var(--chakra-colors-teal-400, #38b2ac)",
        },
        ...rest.css,
      }}
    >
      <ChakraSelect.Trigger ref={ref}>{children}</ChakraSelect.Trigger>
      <ChakraSelect.IndicatorGroup>
        {clearable && <SelectClearTrigger />}
        <ChakraSelect.Indicator
          css={{
            transition: "transform 0.2s ease, color 0.2s ease",
          }}
        />
      </ChakraSelect.IndicatorGroup>
    </ChakraSelect.Control>
  )
})

const SelectClearTrigger = React.forwardRef<
  HTMLButtonElement,
  ChakraSelect.ClearTriggerProps
>(function SelectClearTrigger(props, ref) {
  return (
    <ChakraSelect.ClearTrigger asChild {...props} ref={ref}>
      <CloseButton
        size="xs"
        variant="plain"
        focusVisibleRing="inside"
        focusRingWidth="2px"
        pointerEvents="auto"
      />
    </ChakraSelect.ClearTrigger>
  )
})

interface SelectContentProps extends ChakraSelect.ContentProps {
  portalled?: boolean
  portalRef?: React.RefObject<HTMLElement | null>
}

export const SelectContent = React.forwardRef<
  HTMLDivElement,
  SelectContentProps
>(function SelectContent(props, ref) {
  const { portalled = true, portalRef, style, css, ...rest } = props
  return (
    <Portal disabled={!portalled} container={portalRef}>
      <ChakraSelect.Positioner style={{ zIndex: 2200 }}>
        <ChakraSelect.Content
          {...rest}
          ref={ref}
          style={{
            background: "#18202c",
            border: "1.5px solid var(--chakra-colors-teal-500, #319795)",
            borderRadius: "10px",
            boxShadow:
              "0 0 0 1px rgba(56, 178, 172, 0.25), 0 20px 40px -5px rgba(0, 0, 0, 0.95), 0 10px 20px -5px rgba(0, 0, 0, 0.8)",
            padding: "6px",
            marginTop: "6px",
            zIndex: 2200,
            minWidth: "160px",
            overflow: "hidden",
            ...style,
          }}
          css={{
            animationDuration: "150ms",
            animationTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
            borderColor: "var(--chakra-colors-teal-500, #319795) !important",
            borderWidth: "1.5px !important",
            borderStyle: "solid !important",
            ...css,
          }}
        />
      </ChakraSelect.Positioner>
    </Portal>
  )
})

export const SelectItem = React.forwardRef<
  HTMLDivElement,
  ChakraSelect.ItemProps
>(function SelectItem(props, ref) {
  const { item, children, style, css, ...rest } = props
  return (
    <ChakraSelect.Item
      key={item.value}
      item={item}
      {...rest}
      ref={ref}
      style={{
        maxWidth: "100%",
        overflow: "hidden",
        borderRadius: "6px",
        padding: "8px 12px",
        margin: "2px 0",
        cursor: "pointer",
        transition: "all 0.15s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        ...style,
      }}
      css={{
        "&[data-highlighted], &:hover": {
          background: "rgba(255, 255, 255, 0.08) !important",
          color: "#fff !important",
        },
        "&[data-state=checked]": {
          background: "rgba(49, 151, 149, 0.2) !important",
          color: "var(--chakra-colors-teal-300, #4fd1c5) !important",
          fontWeight: "600 !important",
        },
        ...css,
      }}
    >
      {children}
      <ChakraSelect.ItemIndicator
        css={{
          color: "var(--chakra-colors-teal-400, #38b2ac)",
          marginLeft: "auto",
        }}
      />
    </ChakraSelect.Item>
  )
})

interface SelectValueTextProps
  extends Omit<ChakraSelect.ValueTextProps, "children"> {
  children?(items: CollectionItem[]): React.ReactNode
}

export const SelectValueText = React.forwardRef<
  HTMLSpanElement,
  SelectValueTextProps
>(function SelectValueText(props, ref) {
  const { children, ...rest } = props
  return (
    <ChakraSelect.ValueText {...rest} ref={ref}>
      <ChakraSelect.Context>
        {(select) => {
          const items = select.selectedItems
          if (items.length === 0) return props.placeholder
          if (children) return children(items)
          if (items.length === 1)
            return select.collection.stringifyItem(items[0])
          return `${items.length} selected`
        }}
      </ChakraSelect.Context>
    </ChakraSelect.ValueText>
  )
})

export const SelectRoot = React.forwardRef<
  HTMLDivElement,
  ChakraSelect.RootProps
>(function SelectRoot(props, ref) {
  return (
    <ChakraSelect.Root
      {...props}
      ref={ref}
      positioning={{ sameWidth: true, ...props.positioning }}
    >
      {props.asChild ? (
        props.children
      ) : (
        <>
          <ChakraSelect.HiddenSelect />
          {props.children}
        </>
      )}
    </ChakraSelect.Root>
  )
}) as ChakraSelect.RootComponent

interface SelectItemGroupProps extends ChakraSelect.ItemGroupProps {
  label: React.ReactNode
}

export const SelectItemGroup = React.forwardRef<
  HTMLDivElement,
  SelectItemGroupProps
>(function SelectItemGroup(props, ref) {
  const { children, label, ...rest } = props
  return (
    <ChakraSelect.ItemGroup {...rest} ref={ref}>
      <ChakraSelect.ItemGroupLabel>{label}</ChakraSelect.ItemGroupLabel>
      {children}
    </ChakraSelect.ItemGroup>
  )
})

export const SelectLabel = ChakraSelect.Label
export const SelectItemText = ChakraSelect.ItemText
