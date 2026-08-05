import { SimpleGrid, Skeleton, Stack } from "@chakra-ui/react";

const loading = () => {
  return (
    <Stack gap={6}>
      <Skeleton height='32px' width='250px' />
      <SimpleGrid columns={{ base: 1, sm: 2, xl: 4 }} gap={5}>
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} height='90px' borderRadius='lg' />
        ))}
      </SimpleGrid>
    </Stack>
  );
};

export default loading;
