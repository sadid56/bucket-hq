import React, { useState } from "react";
import Link from "next/link";
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
import { useMounted } from "@/hooks/useMounted";

interface DashboardSidebarProps {
  activeOrgId: string;
  onOrgChange: (id: string) => void;
  onMobileMenuClose?: () => void;
  initialOrgs?: any[];
  initialUser?: any;
}

export function DashboardSidebar({
  activeOrgId,
  onOrgChange,
  onMobileMenuClose,
  initialOrgs,
  initialUser,
}: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const mounted = useMounted();
  const [isCreateOrgOpen, setIsCreateOrgOpen] = useState(false);

  const { data: user } = useGetMe();
  const { data: orgList } = useOrgs();
  const [isPending, setIsPending] = useState(false);

  const effectiveUser = user || initialUser;
  const effectiveOrgs = orgList || initialOrgs || [];
  const isAdmin = effectiveUser?.role === "ADMIN";

  const orgCollection = React.useMemo(() => {
    return createListCollection({
      items: effectiveOrgs.map((org: any) => ({ label: org.name, value: org.slug || org.id })),
    });
  }, [effectiveOrgs]);

  const activeItemValue = React.useMemo(() => {
    const matched = effectiveOrgs.find((o: any) => o.slug === activeOrgId || o.id === activeOrgId);
    return matched ? (matched.slug || matched.id) : activeOrgId;
  }, [effectiveOrgs, activeOrgId]);

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
      if (res.success && res.org) {
        const target = res.org.slug || res.org.id;
        window.location.href = `/dashboard/${target}`;
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
        {effectiveOrgs.length > 0 && !isAdmin && (
          <Stack gap={1.5}>
            <Text fontSize='xs' fontWeight='bold' color='fg.muted' textTransform='uppercase'>
              Active Workspace
            </Text>
            <SelectRoot
              collection={orgCollection}
              value={[activeItemValue]}
              onValueChange={(details) => details.value[0] && onOrgChange(details.value[0])}
              size='sm'
            >
              <SelectTrigger>
                <SelectValueText placeholder='Select workspace' />
              </SelectTrigger>
              <SelectContent style={{ background: "var(--chakra-colors-bg-panel)", zIndex: 1600, maxWidth: "220px" }}>
                {orgCollection.items.map((org) => (
                  <SelectItem item={org} key={org.value}>
                    <Text
                      truncate
                      maxW="165px"
                      title={org.label}
                    >
                      {org.label}
                    </Text>
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
              const isActive = subPath
                ? pathname.endsWith(subPath)
                : (pathname === `/dashboard/${activeItemValue}` || pathname === `/dashboard/${activeOrgId}`);
              const targetPath = subPath ? `/dashboard/${activeItemValue}${subPath}` : `/dashboard/${activeItemValue}`;
              return (
                <Button
                  key={link.path}
                  asChild
                  variant={isActive ? "subtle" : "ghost"}
                  colorPalette={isActive ? "teal" : "gray"}
                  justifyContent='flex-start'
                  size='sm'
                  width='100%'
                >
                  <Link href={targetPath}>
                    <Flex align='center' gap={3} width='100%' overflow='hidden'>
                      {link.icon}
                      <Text fontWeight={isActive ? "semibold" : "medium"} truncate>
                        {link.label}
                      </Text>
                    </Flex>
                  </Link>
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
              const isActive = subPath
                ? pathname.endsWith(subPath)
                : (pathname === `/admin/${activeItemValue}` || pathname === `/admin/${activeOrgId}`);
              const targetPath = subPath ? `/admin/${activeItemValue}${subPath}` : `/admin/${activeItemValue}`;
              return (
                <Button
                  key={link.path}
                  asChild
                  variant={isActive ? "subtle" : "ghost"}
                  colorPalette={isActive ? "purple" : "gray"}
                  justifyContent='flex-start'
                  size='sm'
                  width='100%'
                >
                  <Link href={targetPath}>
                    <Flex align='center' gap={3} width='100%' overflow='hidden'>
                      {link.icon}
                      <Text fontWeight={isActive ? "semibold" : "medium"} truncate>{link.label}</Text>
                    </Flex>
                  </Link>
                </Button>
              );
            })}
          </Stack>
        )}
      </Stack>

      {/* Footer User Profile & Actions */}
      <Box pt={3} borderTopWidth='1px' borderColor='border.subtle'>
        <Box
          p={2.5}
          borderRadius='xl'
          bg='bg.subtle'
          borderWidth='1px'
          borderColor='border.subtle'
          transition='all 0.2s'
          _hover={{ borderColor: "border.muted" }}
        >
          <Flex align='center' justify='space-between' gap={2}>
            <Flex align='center' gap={2.5} minW={0} flex={1}>
              {effectiveUser?.image ? (
                <Box w={8} h={8} minW={8} borderRadius='full' overflow='hidden' border='1.5px solid var(--chakra-colors-teal-500)'>
                  <img
                    src={effectiveUser.image}
                    alt={effectiveUser.name || "User"}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </Box>
              ) : (
                <Center
                  w={8}
                  h={8}
                  minW={8}
                  borderRadius='full'
                  bg='teal.500'
                  color='white'
                  fontWeight='bold'
                  fontSize='xs'
                  shadow='xs'
                >
                  {(effectiveUser?.name?.[0] || effectiveUser?.email?.[0] || "U").toUpperCase()}
                </Center>
              )}
              <Box minW={0} flex={1} overflow='hidden'>
                <Text fontSize='xs' fontWeight='bold' truncate lineHeight='short'>
                  {effectiveUser?.name || "Account"}
                </Text>
                <Text fontSize='10px' color='fg.muted' truncate lineHeight='short'>
                  {effectiveUser?.email || ""}
                </Text>
              </Box>
            </Flex>

            <Flex align='center' gap={1} shrink={0}>
              <Button
                size='xs'
                variant='ghost'
                p={1.5}
                h={7}
                w={7}
                minW={7}
                borderRadius='md'
                color='fg.muted'
                _hover={{ color: "fg.default", bg: "bg.panel" }}
                onClick={toggleTheme}
                title={mounted && theme === "dark" ? "Light mode" : "Dark mode"}
              >
                {mounted && theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
              </Button>
              <Button
                size='xs'
                variant='ghost'
                p={1.5}
                h={7}
                w={7}
                minW={7}
                borderRadius='md'
                color='fg.muted'
                _hover={{ color: "red.500", bg: "red.500/10" }}
                onClick={handleSignOut}
                title='Sign out'
              >
                <LogOut size={14} />
              </Button>
            </Flex>
          </Flex>
        </Box>
      </Box>

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
