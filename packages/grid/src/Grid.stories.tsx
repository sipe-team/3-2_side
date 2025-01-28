import type { Meta, StoryObj } from '@storybook/react';
import * as Grid from './Grid';

const meta = {
  title: 'Grid',
  component: Grid.Root,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div
        style={{
          padding: '20px',
          maxWidth: '100%',
        }}
      >
        <Story />
      </div>
    ),
  ],
  argTypes: {
    templateColumns: {
      control: 'text',
      description: 'Grid template columns',
    },
    templateRows: {
      control: 'text',
      description: 'Grid template rows',
    },
    gap: {
      control: 'text',
      description: 'Gap between grid items',
    },
  },
} satisfies Meta<typeof Grid.Root>;

export default meta;
type Story = StoryObj<typeof Grid.Root>;

const Box = ({ children }: { children?: React.ReactNode }) => (
  <div
    style={{
      width: '100%',
      height: '100%',
      minHeight: '5rem',
      backgroundClip: 'padding-box',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='6' height='6' viewBox='0 0 6 6' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239C92AC' fill-opacity='0.2' fill-rule='evenodd'%3E%3Cpath d='M5 0h1L0 6V5zM6 5v1H5z'/%3E%3C/g%3E%3C/svg%3E")`,
      backgroundRepeat: 'repeat',
      borderWidth: '1px',
      backgroundColor: '#e4e4e7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}
  >
    {children}
  </div>
);

export const Basic: Story = {
  args: {
    templateColumns: 'repeat(3, 1fr)',
    gap: '1rem',
    children: [
      <Box key="1" />,
      <Box key="2" />,
      <Box key="3" />,
      <Box key="4" />,
      <Box key="5" />,
      <Box key="6" />,
    ],
  },
};

export const GridTemplateAreas: Story = {
  render: () => (
    <Grid.Root
      templateAreas={`
        "header header header"
        "sidebar main main"
        ". . ."
        "footer footer footer"
      `}
      templateColumns="200px 1fr"
      gap="1rem"
    >
      <Grid.Item area="header">
        <Box>Header</Box>
      </Grid.Item>
      <Grid.Item area="sidebar">
        <Box>Sidebar</Box>
      </Grid.Item>
      <Grid.Item area="main">
        <Box>Main</Box>
      </Grid.Item>
      <Grid.Item area="footer">
        <Box>Footer</Box>
      </Grid.Item>
    </Grid.Root>
  ),
};

export const SpanningColumns: Story = {
  render: () => (
    <Grid.Root
      templateColumns="repeat(4, 1fr)"
      templateRows="repeat(2, 1fr)"
      gap="1rem"
    >
      <Grid.Item rowSpan={2}>
        <Box>rowSpan 2</Box>
      </Grid.Item>
      <Grid.Item colSpan={2}>
        <Box>colSpan 2</Box>
      </Grid.Item>
      <Grid.Item colSpan={1}>
        <Box>colSpan 1</Box>
      </Grid.Item>
      <Grid.Item colSpan={3}>
        <Box>colSpan 3</Box>
      </Grid.Item>
    </Grid.Root>
  ),
};

export const NestedGrids: Story = {
  render: () => (
    <Grid.Root templateColumns="repeat(2, 1fr)" gap="1rem">
      <Box>Outer Grid</Box>
      <Grid.Root templateColumns="repeat(2, 1fr)" gap="0.5rem">
        <Box>Inner Grid 1</Box>
        <Box>Inner Grid 2</Box>
        <Box>Inner Grid 3</Box>
        <Box>Inner Grid 4</Box>
      </Grid.Root>
    </Grid.Root>
  ),
};
