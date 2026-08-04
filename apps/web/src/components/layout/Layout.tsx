"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { useTheme } from "next-themes";
import { Box, Flex, Text, Button, Stack, Spinner, Heading, Center, createListCollection, Drawer } from "@chakra-ui/react";
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValueText } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useGetMe } from "@/react-query/users/actions";
import { useOrgs, useCreateOrg } from "@/react-query/organizations/actions";
import { Home, Folder, Key, Users, Settings as SettingsIcon, Lock, Shield, BarChart3, Sun, Moon, LogOut, Menu, X, Database } from "lucide-react";
import { PromptDialog } from "@/components/shared/PromptDialog";
import { Logo } from "@/components/shared/Logo";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeOrgId, setActiveOrgId] = useState("");
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [autoCreating, setAutoCreating] = useState(false);

  const params = useParams();
  const orgIdParam = params?.orgId as string | undefined;

  const { data: user, isLoading: loadingUser } = useGetMe();
  const { data: orgList, isLoading: loadingOrgs } = useOrgs();
  const createOrg = useCreateOrg();

  const orgCollection = React.useMemo(() => {
    return createListCollection({
      items: (orgList || []).map((org) => ({ label: org.name, value: org.id })),
    });
  }, [orgList]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/login");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        router.replace("/login");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    if (!loadingOrgs && orgList && orgList.length === 0 && user && !autoCreating) {
      setAutoCreating(true);
      const defaultName = user.name ? `${user.name}'s Workspace` : "My Workspace";
      createOrg.mutate(defaultName, {
        onSuccess: () => {
          window.location.reload();
        },
        onSettled: () => {
          setAutoCreating(false);
        },
      });
    }
  }, [loadingOrgs, orgList, user, autoCreating]);

  useEffect(() => {
    if (orgList && orgList.length > 0) {
      const stored = localStorage.getItem("active_organization_id");
      const found = orgList.find((o) => o.id === (orgIdParam || stored));
      const initialOrgId = found ? found.id : (orgList[0]?.id || "");
      
      setActiveOrgId(initialOrgId);
      localStorage.setItem("active_organization_id", initialOrgId);

      if (orgIdParam !== initialOrgId) {
        let newPath = `/dashboard/${initialOrgId}`;
        const pathParts = pathname.split("/").filter(Boolean);
        if (pathParts.length > 1) {
          const hasOldOrgId = orgList.some((o) => o.id === pathParts[1]);
          const subpath = hasOldOrgId ? pathParts.slice(2).join("/") : pathParts.slice(1).join("/");
          if (subpath) {
            newPath = `/dashboard/${initialOrgId}/${subpath}`;
          }
        }
        router.replace(newPath);
      }
    }
  }, [orgList, orgIdParam, pathname, router]);

  const handleOrgChange = (id: string) => {
    setActiveOrgId(id);
    localStorage.setItem("active_organization_id", id);
    
    const pathParts = pathname.split("/").filter(Boolean);
    let subpath = "";
    if (orgList && pathParts.length > 1) {
      const hasOldOrgId = orgList.some((o) => o.id === pathParts[1]);
      subpath = hasOldOrgId ? pathParts.slice(2).join("/") : pathParts.slice(1).join("/");
    }
    
    const newPath = subpath ? `/dashboard/${id}/${subpath}` : `/dashboard/${id}`;
    window.location.href = newPath;
  };

  const handleCreateOrgConfirm = (name: string) => {
    createOrg.mutate(name, {
      onSuccess: (data: any) => {
        if (data?.id) {
          localStorage.setItem("active_organization_id", data.id);
          window.location.href = `/dashboard/${data.id}`;
        } else {
          window.location.href = "/dashboard";
        }
      },
      onSettled: () => {
        setIsCreateOrgOpen(false);
      },
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("active_organization_id");
    router.push("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const loading = !mounted || loadingUser || loadingOrgs || autoCreating;

  if (loading) {
    return (
      <Flex height="100vh" overflow="hidden" bg="bg.canvas" direction={{ base: "column", md: "row" }}>
        {/* Sidebar - Desktop */}
        <Box
          width="260px"
          bg="bg.panel"
          borderRightWidth="1px"
          borderColor="border.subtle"
          display={{ base: "none", md: "block" }}
          p={5}
          height="100%"
        >
          <Stack gap={6}>
            <Box height="32px" width="120px" bg="teal.500" opacity={0.2} borderRadius="md" />
            <Box height="40px" width="100%" bg="bg.muted" borderRadius="md" />
            <Stack gap={3} mt={4}>
              <Box height="32px" width="100%" bg="bg.muted" borderRadius="md" />
              <Box height="32px" width="100%" bg="bg.muted" borderRadius="md" />
              <Box height="32px" width="100%" bg="bg.muted" borderRadius="md" />
              <Box height="32px" width="100%" bg="bg.muted" borderRadius="md" />
              <Box height="32px" width="100%" bg="bg.muted" borderRadius="md" />
            </Stack>
          </Stack>
        </Box>

        {/* Mobile Header */}
        <Flex
          display={{ base: "flex", md: "none" }}
          align="center"
          justify="space-between"
          p={4}
          bg="bg.panel"
          borderBottomWidth="1px"
          borderColor="border.subtle"
        >
          <Box height="24px" width="100px" bg="teal.500" opacity={0.2} borderRadius="md" />
          <Flex gap={2}>
            <Box height="32px" width="32px" bg="bg.muted" borderRadius="md" />
            <Box height="32px" width="32px" bg="bg.muted" borderRadius="md" />
          </Flex>
        </Flex>

        {/* Main Content Area */}
        <Flex direction="column" flex="1" p={{ base: 4, md: 8 }} gap={6} height="100%" overflowY="auto">
          <Flex justify="space-between" align="center">
            <Stack gap={2}>
              <Box height="32px" width={{ base: "150px", md: "200px" }} bg="bg.muted" borderRadius="md" />
              <Box height="16px" width={{ base: "220px", md: "300px" }} bg="bg.muted" borderRadius="md" />
            </Stack>
            <Box height="40px" width={{ base: "100px", md: "150px" }} bg="bg.muted" borderRadius="md" />
          </Flex>
          <Box height="120px" width="100%" bg="bg.muted" borderRadius="md" />
          <Stack gap={4} mt={4}>
            <Box height="48px" width="100%" bg="bg.muted" borderRadius="md" />
            <Box height="48px" width="100%" bg="bg.muted" borderRadius="md" />
            <Box height="48px" width="100%" bg="bg.muted" borderRadius="md" />
          </Stack>
        </Flex>
      </Flex>
    );
  }

  const orgs = orgList || [];

  const isAdmin = user?.role === "ADMIN";

  // Navigation Links
  const navLinks = [
    { label: "Dashboard", path: "/dashboard", icon: <Home size={18} /> },
    { label: "File Explorer", path: "/dashboard/explorer", icon: <Folder size={18} /> },
    { label: "Connections", path: "/dashboard/connections", icon: <Key size={18} /> },
    { label: "Team Management", path: "/dashboard/team", icon: <Users size={18} /> },
    { label: "Settings", path: "/dashboard/settings", icon: <SettingsIcon size={18} /> },
  ];

  const adminLinks = [
    { label: "Overview Status", path: "/admin", icon: <BarChart3 size={18} /> },
    { label: "Manage Users", path: "/admin/users", icon: <Lock size={18} /> },
    { label: "Audit Logs", path: "/admin/audit", icon: <Shield size={18} /> },
  ];

  const renderSidebarContent = () => (
    <Flex height="100%" direction="column" justify="space-between">
      <Stack gap={6}>
        <Flex align="center" gap={2}>
          <Logo size={22} />
          <Heading size="md" color="teal.500" fontWeight="black" letterSpacing="tight">
            BucketHQ
          </Heading>
        </Flex>

        {/* Org Selector */}
        {orgs.length > 0 && (
          <Stack gap={1.5}>
            <Text fontSize="xs" fontWeight="bold" color="fg.muted" textTransform="uppercase">
              Active Workspace
            </Text>
            <SelectRoot
              collection={orgCollection}
              value={[activeOrgId]}
              onValueChange={(details) => details.value[0] && handleOrgChange(details.value[0])}
              size="sm"
            >
              <SelectTrigger>
                <SelectValueText placeholder="Select workspace" />
              </SelectTrigger>
              <SelectContent style={{ background: "var(--chakra-colors-bg-panel)", zIndex: 1600 }}>
                {orgCollection.items.map((org) => (
                  <SelectItem item={org} key={org.value}>
                    {org.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
            <Button size="xs" variant="ghost" colorPalette="teal" justifyContent="flex-start" onClick={() => { setIsMobileMenuOpen(false); setIsCreateOrgOpen(true); }}>
              + Create Workspace
            </Button>
          </Stack>
        )}

        {/* Navigation Section */}
        <Stack gap={1}>
          <Text fontSize="xs" fontWeight="bold" color="fg.muted" textTransform="uppercase" mb={1}>
            Console
          </Text>
          {navLinks.map((link) => {
            const subPath = link.path.replace("/dashboard", "");
            const isActive = subPath 
              ? pathname.endsWith(subPath) 
              : pathname === `/dashboard/${activeOrgId}`;
            return (
              <Button
                key={link.path}
                variant={isActive ? "subtle" : "ghost"}
                colorPalette={isActive ? "teal" : "gray"}
                justifyContent="flex-start"
                onClick={() => {
                  const targetPath = subPath ? `/dashboard/${activeOrgId}${subPath}` : `/dashboard/${activeOrgId}`;
                  router.push(targetPath);
                }}
                size="sm"
                width="100%"
              >
                <Flex align="center" gap={3}>
                  {link.icon}
                  <Text fontWeight={isActive ? "semibold" : "medium"}>{link.label}</Text>
                </Flex>
              </Button>
            );
          })}
        </Stack>

        {/* Admin Section */}
        {isAdmin && (
          <Stack gap={1}>
            <Text fontSize="xs" fontWeight="bold" color="fg.muted" textTransform="uppercase" mb={1}>
              Admin Panel
            </Text>
            {adminLinks.map((link) => {
              const subPath = link.path.replace("/dashboard", "");
              const isActive = subPath ? pathname.endsWith(subPath) : false;
              return (
                <Button
                  key={link.path}
                  variant={isActive ? "subtle" : "ghost"}
                  colorPalette={isActive ? "purple" : "gray"}
                  justifyContent="flex-start"
                  onClick={() => {
                    const targetPath = subPath ? `/dashboard/${activeOrgId}${subPath}` : `/dashboard/${activeOrgId}`;
                    router.push(targetPath);
                  }}
                  size="sm"
                  width="100%"
                >
                  <Flex align="center" gap={3}>
                    {link.icon}
                    <Text fontWeight={isActive ? "semibold" : "medium"}>{link.label}</Text>
                  </Flex>
                </Button>
              );
            })}
          </Stack>
        )}
      </Stack>

      {/* Footer User Profile & Actions */}
      <Stack gap={3} pt={4} borderTopWidth="1px" borderColor="border.subtle">
        <Flex align="center" gap={3}>
          <Center w={8} h={8} borderRadius="full" bg="teal.500">
            <Text color="white" fontWeight="bold" fontSize="sm">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </Text>
          </Center>
          <Box overflow="hidden">
            <Text fontSize="sm" fontWeight="bold" truncate>
              {user?.name}
            </Text>
            <Text fontSize="xs" color="fg.muted" truncate>
              {user?.email}
            </Text>
          </Box>
        </Flex>

        <Flex gap={2}>
          <Button size="sm" variant="ghost" onClick={toggleTheme} flex="1">
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          <Button size="sm" colorPalette="red" variant="ghost" onClick={handleSignOut} flex="1">
            <LogOut size={18} />
          </Button>
        </Flex>
      </Stack>
    </Flex>
  );

  return (
    <Flex height="100vh" overflow="hidden" bg="bg.canvas">
      {/* Sidebar - Desktop */}
      <Box
        width="260px"
        bg="bg.panel"
        borderRightWidth="1px"
        borderColor="border.subtle"
        display={{ base: "none", md: "block" }}
        p={5}
        height="100%"
        overflowY="auto"
      >
        {renderSidebarContent()}
      </Box>

      {/* Main Content Area */}
      <Flex direction="column" flex="1" height="100%" overflowY="auto">
        {/* Mobile Header */}
        <Flex
          display={{ base: "flex", md: "none" }}
          align="center"
          justify="space-between"
          p={4}
          bg="bg.panel"
          borderBottomWidth="1px"
          borderColor="border.subtle"
          position="relative"
          zIndex={110}
        >
          <Flex align="center" gap={2}>
            <Logo size={18} />
            <Heading size="sm" color="teal.500" fontWeight="bold">
              BucketHQ
            </Heading>
          </Flex>
          <Flex align="center" gap={2}>
            <Button size="sm" variant="ghost" onClick={toggleTheme}>
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </Flex>
        </Flex>

        {/* Mobile Navigation Drawer */}
        <Drawer.Root open={isMobileMenuOpen} onOpenChange={(e) => setIsMobileMenuOpen(e.open)} placement="start">
          <Drawer.Backdrop />
          <Drawer.Positioner style={{ zIndex: 1500 }}>
            <Drawer.Content bg="bg.panel" p={5} height="100%" width="280px" maxWidth="100vw">
              {renderSidebarContent()}
            </Drawer.Content>
          </Drawer.Positioner>
        </Drawer.Root>

        {/* Dynamic Page Target */}
        <Box p={{ base: 4, md: 8 }} flex="1" bg="bg.canvas">
          {children}
        </Box>
      </Flex>

      <PromptDialog
        isOpen={isCreateOrgOpen}
        title="Create Workspace"
        placeholder="e.g. My Next Project"
        confirmLabel="Create"
        isLoading={createOrg.isPending}
        onConfirm={handleCreateOrgConfirm}
        onCancel={() => setIsCreateOrgOpen(false)}
      />
    </Flex>
  );
}


