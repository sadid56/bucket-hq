"use client";

import React from "react";
import { Stack, Box, Button, Flex, Heading, Text } from "@chakra-ui/react";
import { ConnectionForm } from "@/features/connections/ConnectionForm";
import { ConnectionList } from "@/features/connections/ConnectionList";
import { useParams } from "next/navigation";
import { useConnections } from "@/react-query/connections/actions";
import { Plus, X } from "lucide-react";
import { useQueryState } from "nuqs";

export function ConnectionsClient() {
  const params = useParams();
  const orgId = params?.orgId as string | undefined;
  const { data: connections = [], isLoading } = useConnections(orgId);

  const [modal, setModal] = useQueryState("modal");

  const handleClose = () => {
    setModal(null);
  };

  return (
    <Stack gap={6}>
      {/* Page Header */}
      <Flex
        align={{ base: "stretch", sm: "center" }}
        justify='space-between'
        pb={4}
        borderBottomWidth='1px'
        borderColor='border.subtle'
        gap={4}
        direction={{ base: "column", sm: "row" }}
      >
        <Stack gap={1}>
          <Heading size='lg' fontWeight='bold'>
            Connections
          </Heading>
          <Text fontSize='sm' color='fg.muted'>
            Manage credentials and configurations for your connected cloud storage providers.
          </Text>
        </Stack>
        <Button
          colorPalette='teal'
          onClick={() => setModal("add-connection")}
          gap={1.5}
          size='sm'
          alignSelf={{ base: "flex-start", sm: "auto" }}
        >
          <Plus size={16} />
          <span>Add Connection</span>
        </Button>
      </Flex>

      {/* Connections List */}
      <Box>
        <ConnectionList connections={connections} isLoading={isLoading} />
      </Box>

      {/* Add Connection Modal */}
      {modal === "add-connection" && (
        <Box
          position='fixed'
          inset={0}
          bg='rgba(0, 0, 0, 0.5)'
          backdropFilter='blur(4px)'
          display='flex'
          alignItems='center'
          justifyContent='center'
          zIndex={1500}
        >
          <Box position='relative' width='90%' maxWidth='3xl' maxHeight='90vh' overflowY='auto'>
            {/* Modal Close Button */}
            <Button size='xs' variant='ghost' position='absolute' top={4} right={4} onClick={handleClose} zIndex={10}>
              <X size={16} />
            </Button>

            <ConnectionForm onSuccess={handleClose} />
          </Box>
        </Box>
      )}
    </Stack>
  );
}
