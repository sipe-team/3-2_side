import { Slot } from '@radix-ui/react-slot';
import { clsx as cx } from 'clsx';
import {
  type CSSProperties,
  type ComponentProps,
  type ForwardedRef,
  forwardRef,
} from 'react';
import styles from './Grid.module.css';

export interface GridProps extends ComponentProps<'div'> {
  templateColumns?: CSSProperties['gridTemplateColumns'];
  templateRows?: CSSProperties['gridTemplateRows'];
  templateAreas?: CSSProperties['gridTemplateAreas'];
  gap?: CSSProperties['gap'];
  autoFlow?: CSSProperties['gridAutoFlow'];
  autoRows?: CSSProperties['gridAutoRows'];
  autoColumns?: CSSProperties['gridAutoColumns'];
  inline?: boolean;
  style?: CSSProperties;
  asChild?: boolean;
}

export const Grid = forwardRef(function Grid(
  {
    templateColumns,
    templateRows,
    templateAreas,
    autoFlow,
    autoRows,
    autoColumns,
    gap,
    inline,
    style,
    className,
    children,
    asChild,
    ...props
  }: GridProps,
  ref: ForwardedRef<any>,
) {
  const Component = asChild ? Slot : 'div';

  const gridStyle = {
    '--grid-display': inline ? 'inline-grid' : 'grid',
    '--grid-template-columns': templateColumns,
    '--grid-template-rows': templateRows,
    '--grid-template-areas': templateAreas,
    '--grid-auto-columns': autoColumns,
    '--grid-auto-rows': autoRows,
    '--grid-auto-flow': autoFlow,
    '--grid-gap': gap,
    ...style,
  } as React.CSSProperties;

  return (
    <Component
      ref={ref}
      className={cx(styles.grid, className)}
      style={gridStyle}
      {...props}
    >
      {children}
    </Component>
  );
});

Grid.displayName = 'Grid';

export interface GridItemProps extends ComponentProps<'div'> {
  column?: CSSProperties['gridColumn'];
  row?: CSSProperties['gridRow'];
  area?: CSSProperties['gridArea'];
  justifySelf?: CSSProperties['justifySelf'];
  alignSelf?: CSSProperties['alignSelf'];
  colSpan?: number;
  rowSpan?: number;
  colStart?: number | 'auto';
  colEnd?: number | 'auto';
  rowStart?: number | 'auto';
  rowEnd?: number | 'auto';
  style?: CSSProperties;
  asChild?: boolean;
}

export const GridItem = forwardRef(function GridItem(
  {
    column,
    row,
    area,
    justifySelf,
    alignSelf,
    colSpan,
    rowSpan,
    colStart,
    colEnd,
    rowStart,
    rowEnd,
    style,
    className,
    asChild,
    children,
    ...props
  }: GridItemProps,
  ref: ForwardedRef<any>,
) {
  const Component = asChild ? Slot : 'div';

  const getGridColumn = () => {
    if (column) return column;
    if (colSpan) return `span ${colSpan}`;
    if (colStart || colEnd)
      return `${colStart ?? 'auto'} / ${colEnd ?? 'auto'}`;
    return undefined;
  };

  const getGridRow = () => {
    if (row) return row;
    if (rowSpan) return `span ${rowSpan}`;
    if (rowStart || rowEnd)
      return `${rowStart ?? 'auto'} / ${rowEnd ?? 'auto'}`;
    return undefined;
  };

  const gridItemClasses = cx(
    styles['grid-item'],
    {
      [styles['grid-item-column']]: getGridColumn(),
      [styles['grid-item-row']]: getGridRow(),
      [styles['grid-item-area']]: area,
    },
    className,
  );

  const gridItemStyle = {
    '--grid-area': area,
    '--grid-column': getGridColumn(),
    '--grid-row': getGridRow(),
    '--grid-justify-self': justifySelf,
    '--grid-align-self': alignSelf,
    ...style,
  };

  return (
    <Component
      ref={ref}
      className={gridItemClasses}
      style={gridItemStyle}
      {...props}
    >
      {children}
    </Component>
  );
});

GridItem.displayName = 'GridItem';

const Root = Grid;
const Item = GridItem;

export { Root, Item };
