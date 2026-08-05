"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname, useParams } from "next/navigation";
import { useTheme } from "next-themes";
import { Box, Flex, Button, Stack, Heading, Drawer } from "@chakra-ui/react";
import { useGetMe } from "@/react-query/users/actions";
import { useOrgs, useCreateOrg } from "@/react-query/organizations/actions";
import { Sun, Moon, Menu, X } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { DashboardSidebar } from "./DashboardSidebar";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
}

export function DashboardLayoutClient({ children }: DashboardLayoutClientProps) {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeOrgId, setActiveOrgId] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [autoCreating, setAutoCreating] = useState(false);

  const params = useParams();
  const orgIdParam = params?.orgId as string | undefined;

  const { data: user, isLoading: loadingUser } = useGetMe();
  const { data: orgList, isLoading: loadingOrgs } = useOrgs();
  const createOrg = useCreateOrg();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const hasCreatedRef = useRef(false);

  useEffect(() => {
    if (!loadingOrgs && orgList && orgList.length === 0 && user && !autoCreating && !hasCreatedRef.current) {
      hasCreatedRef.current = true;
      setAutoCreating(true);
      const defaultName = user.name ? `${user.name}'s Workspace` : "My Workspace";
      createOrg.mutate(defaultName, {
        onSuccess: (newOrg) => {
          window.location.href = `/dashboard/${newOrg.id}`;
        },
        onError: () => {
          hasCreatedRef.current = false;
          setAutoCreating(false);
        },
      });
    }
  }, [loadingOrgs, orgList, user, autoCreating]);

  useEffect(() => {
    if (orgList && orgList.length > 0) {
      const found = orgList.find((o) => o.id === orgIdParam);
      const activeId = found ? found.id : orgList[0]?.id || "";
      setActiveOrgId(activeId);

      const pathParts = pathname.split("/").filter(Boolean);

      // If we are on "/dashboard" or "/admin" exactly:
      if (pathParts.length === 1 && (pathParts[0] === "dashboard" || pathParts[0] === "admin")) {
        window.location.href = `/${pathParts[0]}/${activeId}`;
        return;
      }

      // If orgIdParam is in the URL, but doesn't match activeId:
      if (orgIdParam && orgIdParam !== activeId) {
        const hasOldOrgId = orgList.some((o) => o.id === orgIdParam);
        const subpath = hasOldOrgId ? pathParts.slice(2).join("/") : pathParts.slice(1).join("/");
        const targetPath = subpath ? `/${pathParts[0]}/${activeId}/${subpath}` : `/${pathParts[0]}/${activeId}`;
        window.location.href = targetPath;
      }
    }
  }, [orgList, orgIdParam, pathname]);

  const handleOrgChange = (id: string) => {
    setActiveOrgId(id);

    const pathParts = pathname.split("/").filter(Boolean);
    let subpath = "";
    if (orgList && pathParts.length > 1) {
      const hasOldOrgId = orgList.some((o) => o.id === pathParts[1]);
      subpath = hasOldOrgId ? pathParts.slice(2).join("/") : pathParts.slice(1).join("/");
    }

    const newPath = subpath ? `/dashboard/${id}/${subpath}` : `/dashboard/${id}`;
    window.location.href = newPath;
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const loading = !mounted || loadingUser || loadingOrgs || autoCreating;

  if (loading) {
    return (
      <Flex height='100vh' overflow='hidden' bg='bg.canvas' direction={{ base: "column", md: "row" }}>
        {/* Sidebar - Desktop */}
        <Box
          width='260px'
          bg='bg.panel'
          borderRightWidth='1px'
          borderColor='border.subtle'
          display={{ base: "none", md: "block" }}
          p={5}
          height='100%'
        >
          <Stack gap={6}>
            <Box height='32px' width='120px' bg='teal.500' opacity={0.2} borderRadius='md' />
            <Box height='40px' width='100%' bg='bg.muted' borderRadius='md' />
            <Stack gap={3} mt={4}>
              <Box height='32px' width='100%' bg='bg.muted' borderRadius='md' />
              <Box height='32px' width='100%' bg='bg.muted' borderRadius='md' />
              <Box height='32px' width='100%' bg='bg.muted' borderRadius='md' />
              <Box height='32px' width='100%' bg='bg.muted' borderRadius='md' />
              <Box height='32px' width='100%' bg='bg.muted' borderRadius='md' />
            </Stack>
          </Stack>
        </Box>

        {/* Mobile Header */}
        <Flex
          display={{ base: "flex", md: "none" }}
          align='center'
          justify='space-between'
          p={4}
          bg='bg.panel'
          borderBottomWidth='1px'
          borderColor='border.subtle'
        >
          <Box height='24px' width='100px' bg='teal.500' opacity={0.2} borderRadius='md' />
          <Flex gap={2}>
            <Box height='32px' width='32px' bg='bg.muted' borderRadius='md' />
            <Box height='32px' width='32px' bg='bg.muted' borderRadius='md' />
          </Flex>
        </Flex>

        {/* Main Content Area */}
        <Flex direction='column' flex='1' p={{ base: 4, md: 8 }} gap={6} height='100%' overflowY='auto'>
          <Flex justify='space-between' align='center'>
            <Stack gap={2}>
              <Box height='32px' width={{ base: "150px", md: "200px" }} bg='bg.muted' borderRadius='md' />
              <Box height='16px' width={{ base: "220px", md: "300px" }} bg='bg.muted' borderRadius='md' />
            </Stack>
            <Box height='40px' width={{ base: "100px", md: "150px" }} bg='bg.muted' borderRadius='md' />
          </Flex>
          <Box height='120px' width='100%' bg='bg.muted' borderRadius='md' />
          <Stack gap={4} mt={4}>
            <Box height='48px' width='100%' bg='bg.muted' borderRadius='md' />
            <Box height='48px' width='100%' bg='bg.muted' borderRadius='md' />
            <Box height='48px' width='100%' bg='bg.muted' borderRadius='md' />
          </Stack>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex height='100vh' overflow='hidden' bg='bg.canvas'>
      {/* Sidebar - Desktop */}
      <Box
        width='260px'
        bg='bg.panel'
        borderRightWidth='1px'
        borderColor='border.subtle'
        display={{ base: "none", md: "block" }}
        p={5}
        height='100%'
        overflowY='auto'
      >
        <DashboardSidebar activeOrgId={activeOrgId} onOrgChange={handleOrgChange} />
      </Box>

      {/* Main Content Area */}
      <Flex direction='column' flex='1' height='100%' overflowY='auto'>
        {/* Mobile Header */}
        <Flex
          display={{ base: "flex", md: "none" }}
          align='center'
          justify='space-between'
          p={4}
          bg='bg.panel'
          borderBottomWidth='1px'
          borderColor='border.subtle'
          position='relative'
          zIndex={110}
        >
          <Flex align='center' gap={2}>
            <Logo size={18} />
            <Heading size='sm' color='teal.500' fontWeight='bold'>
              BucketHQ
            </Heading>
          </Flex>
          <Flex align='center' gap={2}>
            <Button size='sm' variant='ghost' onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            <Button size='sm' variant='ghost' onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </Flex>
        </Flex>

        {/* Mobile Navigation Drawer */}
        <Drawer.Root open={isMobileMenuOpen} onOpenChange={(e) => setIsMobileMenuOpen(e.open)} placement='start'>
          <Drawer.Backdrop />
          <Drawer.Positioner style={{ zIndex: 1500 }}>
            <Drawer.Content bg='bg.panel' p={5} height='100%' width='280px' maxWidth='100vw'>
              <DashboardSidebar
                activeOrgId={activeOrgId}
                onOrgChange={handleOrgChange}
                onMobileMenuClose={() => setIsMobileMenuOpen(false)}
              />
            </Drawer.Content>
          </Drawer.Positioner>
        </Drawer.Root>

        {/* Dynamic Page Target */}
        <Box p={{ base: 4, md: 8 }} flex='1' bg='bg.canvas'>
          {children}
        </Box>
      </Flex>
    </Flex>
  );
}
