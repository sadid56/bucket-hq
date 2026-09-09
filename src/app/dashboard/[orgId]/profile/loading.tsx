import { Box, Flex, Skeleton, Stack } from "@chakra-ui/react";

const loading = () => {
  return (
    <Stack gap={6} maxW='xl'>
      {/* Header */}
      <Stack gap={1}>
        <Skeleton height='28px' width='180px' />
        <Skeleton height='16px' width='360px' />
      </Stack>

      {/* Avatar + Name Preview */}
      <Box bg='bg.panel' p={6} borderRadius='lg' borderWidth='1px'>
        <Stack gap={6}>
          <Flex align='center' gap={5}>
            <Skeleton height='64px' width='64px' borderRadius='full' />
            <Stack gap={1}>
              <Skeleton height='18px' width='140px' />
              <Skeleton height='14px' width='180px' />
            </Stack>
          </Flex>

          {/* Form Fields */}
          <Stack gap={4}>
            <Stack gap={2}>
              <Skeleton height='14px' width='100px' />
              <Skeleton height='40px' width='100%' />
            </Stack>
            <Stack gap={2}>
              <Skeleton height='14px' width='120px' />
              <Skeleton height='40px' width='100%' />
            </Stack>
          </Stack>

          <Skeleton height='40px' width='120px' />
        </Stack>
      </Box>
    </Stack>
  );
};

export default loading;
