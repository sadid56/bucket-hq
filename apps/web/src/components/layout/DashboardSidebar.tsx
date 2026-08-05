import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Box, Flex, Text, Button, Stack, Heading, Center, createListCollection } from "@chakra-ui/react";
import { SelectRoot, SelectTrigger, SelectContent, SelectItem, SelectValueText } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useGetMe } from "@/react-query/users/actions";
import { useOrgs } from "@/react-query/organizations/actions";
import { createOrgAction } from "@/actions/organization";
import {
  Home,
  Folder,
  Key,
  Users,
  Settings as SettingsIcon,
  Lock,
  Shield,
  BarChart3,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { Logo } from "@/components/shared/Logo";
import { PromptDialog } from "@/components/shared/PromptDialog";

interface DashboardSidebarProps {
  activeOrgId: string;
  onOrgChange: (id: string) => void;
  onMobileMenuClose?: () => void;
}

export function DashboardSidebar({
  activeOrgId,
  onOrgChange,
  onMobileMenuClose,
}: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);

  const { data: user } = useGetMe();
  const { data: orgList } = useOrgs();
  const [isPending, setIsPending] = useState(false);

  const orgs = orgList || [];
  const isAdmin = user?.role === "ADMIN";

  const orgCollection = React.useMemo(() => {
    return createListCollection({
      items: (orgList || []).map((org) => ({ label: org.name, value: org.id })),
    });
  }, [orgList]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
  };

  const handleCreateOrgConfirm = async (name: string) => {
    setIsPending(true);
    try {
      const res = await createOrgAction(name);
      if (res.success && res.org?.id) {
        window.location.href = `/dashboard/${res.org.id}`;
      } else {
        console.error(res.error || "Failed to create workspace");
        window.location.href = "/dashboard";
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsPending(false);
      setIsCreateOrgOpen(false);
    }
  };

  // Navigation Links
  const navLinks = [
    { label: "Dashboard", path: "/dashboard", icon: <Home size={18} /> },
    { label: "File Explorer", path: "/dashboard/explorer", icon: <Folder size={18} /> },
    { label: "Connections", path: "/dashboard/connections", icon: <Key size={18} /> },
    { label: "Team Management", path: "/dashboard/team", icon: <Users size={18} /> },
    { label: "Settings", path: "/dashboard/settings", icon: <SettingsIcon size={18} /> },
    { label: "Profile", path: "/dashboard/profile", icon: <UserIcon size={18} /> },
  ];

  const adminLinks = [
    { label: "Overview Status", path: "/admin", icon: <BarChart3 size={18} /> },
    { label: "Manage Users", path: "/admin/users", icon: <Lock size={18} /> },
    { label: "Audit Logs", path: "/admin/audit", icon: <Shield size={18} /> },
  ];

  return (
    <Flex height='100%' direction='column' justify='space-between'>
      <Stack gap={6}>
        <Flex align='center' gap={2}>
          <Logo size={22} />
          <Heading size='md' color='teal.500' fontWeight='black' letterSpacing='tight'>
            BucketHQ
          </Heading>
        </Flex>

        {/* Org Selector */}
        {orgs.length > 0 && !isAdmin && (
          <Stack gap={1.5}>
            <Text fontSize='xs' fontWeight='bold' color='fg.muted' textTransform='uppercase'>
              Active Workspace
            </Text>
            <SelectRoot
              collection={orgCollection}
              value={[activeOrgId]}
              onValueChange={(details) => details.value[0] && onOrgChange(details.value[0])}
              size='sm'
            >
              <SelectTrigger>
                <SelectValueText placeholder='Select workspace' />
              </SelectTrigger>
              <SelectContent style={{ background: "var(--chakra-colors-bg-panel)", zIndex: 1600 }}>
                {orgCollection.items.map((org) => (
                  <SelectItem item={org} key={org.value}>
                    {org.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </SelectRoot>
            <Button
              size='xs'
              variant='ghost'
              colorPalette='teal'
              justifyContent='flex-start'
              onClick={() => {
                onMobileMenuClose?.();
                setIsCreateOrgOpen(true);
              }}
            >
              + Create Workspace
            </Button>
          </Stack>
        )}

        {/* Navigation Section */}
        {!isAdmin && (
          <Stack gap={1}>
            <Text fontSize='xs' fontWeight='bold' color='fg.muted' textTransform='uppercase' mb={1}>
              Console
            </Text>
            {navLinks.map((link) => {
              const subPath = link.path.replace("/dashboard", "");
              const isActive = subPath ? pathname.endsWith(subPath) : pathname === `/dashboard/${activeOrgId}`;
              return (
                <Button
                  key={link.path}
                  variant={isActive ? "subtle" : "ghost"}
                  colorPalette={isActive ? "teal" : "gray"}
                  justifyContent='flex-start'
                  onClick={() => {
                    const targetPath = subPath ? `/dashboard/${activeOrgId}${subPath}` : `/dashboard/${activeOrgId}`;
                    router.push(targetPath);
                  }}
                  size='sm'
                  width='100%'
                >
                  <Flex align='center' gap={3}>
                    {link.icon}
                    <Text fontWeight={isActive ? "semibold" : "medium"}>{link.label}</Text>
                  </Flex>
                </Button>
              );
            })}
          </Stack>
        )}

        {/* Admin Section */}
        {isAdmin && (
          <Stack gap={1}>
            <Text fontSize='xs' fontWeight='bold' color='fg.muted' textTransform='uppercase' mb={1}>
              Admin Panel
            </Text>
            {adminLinks.map((link) => {
              const subPath = link.path.replace("/admin", "");
              const isActive = subPath ? pathname.endsWith(subPath) : (pathname === `/admin/${activeOrgId}`);
              return (
                <Button
                  key={link.path}
                  variant={isActive ? "subtle" : "ghost"}
                  colorPalette={isActive ? "purple" : "gray"}
                  justifyContent='flex-start'
                  onClick={() => {
                    const targetPath = subPath ? `/admin/${activeOrgId}${subPath}` : `/admin/${activeOrgId}`;
                    router.push(targetPath);
                  }}
                  size='sm'
                  width='100%'
                >
                  <Flex align='center' gap={3}>
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
      <Stack gap={3} pt={4} borderTopWidth='1px' borderColor='border.subtle'>
        <Flex align='center' gap={3}>
          {user?.image ? (
            <Box w={8} h={8} borderRadius='full' bg='teal.500' overflow='hidden'>
              <img
                src={user.image}
                alt={user.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            </Box>
          ) : (
            <Center w={8} h={8} borderRadius='full' bg='teal.500'>
              <Text color='white' fontWeight='bold' fontSize='sm'>
                {user?.name?.[0]?.toUpperCase() || "U"}
              </Text>
            </Center>
          )}
          <Box overflow='hidden'>
            <Text fontSize='sm' fontWeight='bold' truncate>
              {user?.name}
            </Text>
            <Text fontSize='xs' color='fg.muted' truncate>
              {user?.email}
            </Text>
          </Box>
        </Flex>

        <Flex gap={2}>
          <Button size='sm' variant='ghost' onClick={toggleTheme} flex='1'>
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
          <Button size='sm' colorPalette='red' variant='ghost' onClick={handleSignOut} flex='1'>
            <LogOut size={18} />
          </Button>
        </Flex>
      </Stack>

      <PromptDialog
        isOpen={isCreateOrgOpen}
        title='Create Workspace'
        placeholder='e.g. My Next Project'
        confirmLabel='Create'
        isLoading={isPending}
        onConfirm={handleCreateOrgConfirm}
        onCancel={() => setIsCreateOrgOpen(false)}
      />
    </Flex>
  );
}
