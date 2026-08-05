import { Box, SimpleGrid, Skeleton, Stack } from "@chakra-ui/react";

const loading = () => {
  return (
    <Stack gap={6}>
      {/* Header */}
      <Stack gap={1}>
        <Skeleton height='32px' width='250px' />
        <Skeleton height='16px' width='350px' />
      </Stack>

      {/* KPI Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} gap={5}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height='120px' borderRadius='lg' />
        ))}
      </SimpleGrid>

      {/* Breakdown Cards */}
      <SimpleGrid columns={{ base: 1, md: 2 }} gap={6}>
        <Box bg='bg.panel' p={6} borderRadius='lg' borderWidth='1px'>
          <Stack gap={4}>
            <Skeleton height='20px' width='180px' />
            <Skeleton height='40px' width='100%' borderRadius='md' />
            <Skeleton height='40px' width='100%' borderRadius='md' />
            <Skeleton height='40px' width='100%' borderRadius='md' />
          </Stack>
        </Box>
        <Box bg='bg.panel' p={6} borderRadius='lg' borderWidth='1px'>
          <Stack gap={4}>
            <Skeleton height='20px' width='200px' />
            <Skeleton height='60px' width='100%' borderRadius='md' />
            <Skeleton height='60px' width='100%' borderRadius='md' />
            <Skeleton height='60px' width='100%' borderRadius='md' />
          </Stack>
        </Box>
      </SimpleGrid>
    </Stack>
  );
};

export default loading;
