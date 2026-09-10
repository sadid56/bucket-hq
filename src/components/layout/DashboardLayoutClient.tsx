"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname, useParams, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Box, Flex, Button, Stack, Heading, Drawer } from "@chakra-ui/react";
import { useGetMe } from "@/react-query/users/actions";
import { useOrgs } from "@/react-query/organizations/actions";
import { Sun, Moon, Menu, X } from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { DashboardSidebar } from "./DashboardSidebar";
import { useMounted } from "@/hooks/useMounted";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  initialOrgs?: any[];
  initialUser?: any;
}

export function DashboardLayoutClient({ children, initialOrgs = [], initialUser = null }: DashboardLayoutClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const params = useParams();
  const orgIdParam = params?.orgId as string | undefined;

  const { data: user, isLoading: loadingUser } = useGetMe(initialUser);
  const { data: orgList, isLoading: loadingOrgs } = useOrgs(initialOrgs && initialOrgs.length > 0 ? initialOrgs : undefined);

  const effectiveOrgs = orgList && orgList.length > 0 ? orgList : initialOrgs;
  const effectiveUser = user || initialUser;

  const matchedOrg = effectiveOrgs.find((o: any) => o.slug === orgIdParam || o.id === orgIdParam) || effectiveOrgs[0];

  const initialActiveId = matchedOrg ? matchedOrg.slug || matchedOrg.id : orgIdParam || "";

  const [activeOrgId, setActiveOrgId] = useState(initialActiveId);

  useEffect(() => {
    if (initialActiveId && !activeOrgId) {
      setActiveOrgId(initialActiveId);
    }
  }, [initialActiveId, activeOrgId]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (effectiveOrgs && effectiveOrgs.length > 0) {
      const found = effectiveOrgs.find((o: any) => o.slug === orgIdParam || o.id === orgIdParam);

      if (found) {
        const activeSlug = found.slug || found.id;
        setActiveOrgId(activeSlug);

        if (orgIdParam === found.id && found.slug && found.slug !== found.id) {
          const pathParts = pathname.split("/").filter(Boolean);
          const subpath = pathParts.length > 2 ? pathParts.slice(2).join("/") : "";
          const targetPath = subpath ? `/${pathParts[0]}/${found.slug}/${subpath}` : `/${pathParts[0]}/${found.slug}`;
          router.replace(targetPath);
        }
      } else if (orgIdParam) {
        setActiveOrgId(orgIdParam);
      } else {
        const defaultSlug = effectiveOrgs[0]?.slug || effectiveOrgs[0]?.id || "";
        setActiveOrgId(defaultSlug);
        const pathParts = pathname.split("/").filter(Boolean);
        if (pathParts.length === 1 && (pathParts[0] === "dashboard" || pathParts[0] === "admin")) {
          router.replace(`/${pathParts[0]}/${defaultSlug}`);
        }
      }
    }
  }, [effectiveOrgs, orgIdParam, pathname, router]);

  const handleOrgChange = (idOrSlug: string) => {
    setActiveOrgId(idOrSlug);

    const pathParts = pathname.split("/").filter(Boolean);
    const subpath = pathParts.length > 2 ? pathParts.slice(2).join("/") : "";
    const newPath = subpath ? `/dashboard/${idOrSlug}/${subpath}` : `/dashboard/${idOrSlug}`;
    router.push(newPath);
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const hasOrgs = effectiveOrgs && effectiveOrgs.length > 0;
  const loading = (!mounted && !hasOrgs) || (!hasOrgs && (loadingUser || loadingOrgs));

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

  const isExplorer = pathname?.includes("/explorer");

  return (
    <Flex position='fixed' inset={0} width='100vw' height='100vh' overflow='hidden' bg='bg.canvas'>
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
        flexShrink={0}
      >
        <DashboardSidebar activeOrgId={activeOrgId} onOrgChange={handleOrgChange} initialOrgs={effectiveOrgs} initialUser={effectiveUser} />
      </Box>

      {/* Main Content Area */}
      <Flex
        direction='column'
        flex='1'
        height='100%'
        minH='0'
        overflow={isExplorer ? "hidden" : "auto"}
        className={isExplorer ? undefined : "hide-scrollbar"}
      >
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
              {mounted && theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
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
                initialOrgs={effectiveOrgs}
                initialUser={effectiveUser}
              />
            </Drawer.Content>
          </Drawer.Positioner>
        </Drawer.Root>

        {/* Dynamic Page Target */}
        <Box
          p={isExplorer ? { base: 4, md: 6 } : { base: 4, md: 8 }}
          flex='1'
          height='100%'
          minH='0'
          display={isExplorer ? "flex" : "block"}
          flexDirection={isExplorer ? "column" : undefined}
          overflow={isExplorer ? "hidden" : undefined}
          bg='bg.canvas'
        >
          {children}
        </Box>
      </Flex>
    </Flex>
  );
}
