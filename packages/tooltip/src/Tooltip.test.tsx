import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useEffect, useState } from 'react';
import { describe, expect, test } from 'vitest';
import { Tooltip } from './Tooltip';

describe('Tooltip 기본 동작 테스트', () => {
  test('Tooltip은 초기 상태에서 보이지 않아야 한다.', () => {
    render(
      <Tooltip tooltipContent="Test Tooltip">
        <button type="button">Hover me</button>
      </Tooltip>,
    );

    const tooltip = screen.queryByText('Test Tooltip');
    expect(tooltip).not.toBeInTheDocument();
  });

  test('tooltipContent를 주입하지 않으면 Tooltip이 렌더링되지 않는다.', () => {
    render(
      <Tooltip tooltipContent={null}>
        <button type="button">Hover me</button>
      </Tooltip>,
    );

    const trigger = screen.queryByText('Hover me');
    expect(trigger).toBeInTheDocument();
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  test('hover 트리거일 경우 마우스를 올리면 Tooltip이 나타나고 이탈 시 사라진다.', async () => {
    render(
      <Tooltip tooltipContent="This is a tooltip" trigger="hover">
        <button type="button">Hover me</button>
      </Tooltip>,
    );

    const trigger = screen.getByText('Hover me');

    await userEvent.hover(trigger);
    expect(screen.getByText('This is a tooltip')).toBeInTheDocument();

    await userEvent.unhover(trigger);
    expect(screen.queryByText('This is a tooltip')).not.toBeInTheDocument();
  });

  test('click 트리거일 경우 클릭하면 Tooltip이 표시되고 다시 클릭하면 사라진다.', async () => {
    render(
      <Tooltip tooltipContent="This is a tooltip" trigger="click">
        <button type="button">Click me</button>
      </Tooltip>,
    );

    const trigger = screen.getByText('Click me');

    await userEvent.click(trigger);
    expect(screen.getByText('This is a tooltip')).toBeInTheDocument();

    await userEvent.click(trigger);
    expect(screen.queryByText('This is a tooltip')).not.toBeInTheDocument();
  });

  test('Tooltip 외부 클릭 시 닫힌다.', async () => {
    render(
      <div>
        <Tooltip tooltipContent="This is a tooltip" trigger="click">
          <button type="button">Click me</button>
        </Tooltip>
        <button type="button">Outside</button>
      </div>,
    );

    const trigger = screen.getByText('Click me');
    const outside = screen.getByText('Outside');

    await userEvent.click(trigger);
    expect(screen.getByText('This is a tooltip')).toBeInTheDocument();

    await userEvent.click(outside);
    expect(screen.queryByText('This is a tooltip')).not.toBeInTheDocument();
  });
});

describe('Tooltip 위치 테스트', () => {
  test.each([
    ['top', 'top'],
    ['bottom', 'bottom'],
    ['left', 'left'],
    ['right', 'right'],
  ])('Tooltip이 %s 위치에 렌더링된다.', async (placement, expectedClass) => {
    render(
      <Tooltip tooltipContent="This is a tooltip" placement={placement as any}>
        <button type="button">Hover me</button>
      </Tooltip>,
    );

    const trigger = screen.getByText('Hover me');
    await userEvent.hover(trigger);

    const tooltip = screen.getByText('This is a tooltip');
    expect(tooltip.className).toContain(expectedClass);
  });
});

describe('Tooltip 접근성 테스트', () => {
  test('role="tooltip" 속성이 포함되어 접근성을 보장한다.', async () => {
    render(
      <Tooltip tooltipContent="This is a tooltip">
        <button type="button">Hover me</button>
      </Tooltip>,
    );

    const trigger = screen.getByText('Hover me');
    await userEvent.hover(trigger);

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeInTheDocument();
  });

  test('Esc 키를 누르면 Tooltip이 닫힌다.', async () => {
    render(
      <Tooltip tooltipContent="This is a tooltip" trigger="click">
        <button type="button">Click me</button>
      </Tooltip>,
    );

    const trigger = screen.getByText('Click me');

    await userEvent.click(trigger);
    expect(screen.getByText('This is a tooltip')).toBeInTheDocument();

    await userEvent.keyboard('{Escape}');
    expect(screen.queryByText('This is a tooltip')).not.toBeInTheDocument();
  });
});

describe('Tooltip 스타일 테스트', () => {
  test('props로 주입한 backgroundColor와 padding이 CSS 변수에 반영된다.', async () => {
    render(
      <Tooltip
        tooltipContent="Styled Tooltip"
        tooltipStyle={{ backgroundColor: 'red', padding: '20px' }}
      >
        <button type="button">Hover me</button>
      </Tooltip>,
    );

    const trigger = screen.getByText('Hover me');
    await userEvent.hover(trigger);

    const tooltip = screen.getByText('Styled Tooltip');
    expect(tooltip).toHaveStyle('background-color: red');
    expect(tooltip).toHaveStyle('padding: 20px');
  });

  test('Tooltip이 뷰포트 밖으로 벗어나지 않는다.', async () => {
    render(
      <Tooltip tooltipContent="This is a tooltip" placement="bottom">
        <button type="button" style={{ marginTop: '100vh' }}>
          Hover me
        </button>
      </Tooltip>,
    );

    const trigger = screen.getByText('Hover me');
    await userEvent.hover(trigger);

    const tooltip = screen.getByText('This is a tooltip');
    const rect = tooltip.getBoundingClientRect();

    expect(rect.top).toBeGreaterThanOrEqual(0);
    expect(rect.bottom).toBeLessThanOrEqual(window.innerHeight);
  });

  test('긴 텍스트가 툴팁 내에서 줄 바꿈 처리된다.', async () => {
    render(
      <Tooltip
        tooltipContent="This is a very long tooltip text that should wrap within the tooltip container to avoid overflowing the screen."
        tooltipStyle={{ maxWidth: '150px' }}
      >
        <button type="button">Hover me</button>
      </Tooltip>,
    );

    const trigger = screen.getByText('Hover me');
    await userEvent.hover(trigger);

    const tooltip = screen.getByText(/This is a very long tooltip text/);
    expect(tooltip).toHaveStyle('max-width: 150px');
    expect(tooltip).toHaveStyle('white-space: normal');
  });
});

describe('Tooltip 비동기 데이터 테스트', () => {
  test('Tooltip이 비동기 데이터로 업데이트된다.', async () => {
    const fetchTooltipContent = (): Promise<string> =>
      new Promise((resolve) =>
        setTimeout(() => resolve('Fetched Content'), 500),
      );

    const AsyncTooltip = () => {
      const [content, setContent] = useState('Loading...');

      useEffect(() => {
        fetchTooltipContent().then((data) => setContent(data as string));
      }, []);

      return (
        <Tooltip tooltipContent={content}>
          <button type="button">Hover me</button>
        </Tooltip>
      );
    };

    render(<AsyncTooltip />);

    const trigger = screen.getByText('Hover me');
    await userEvent.hover(trigger);

    expect(screen.getByText('Loading...')).toBeInTheDocument();

    await new Promise((resolve) => setTimeout(resolve, 500));
    expect(screen.getByText('Fetched Content')).toBeInTheDocument();
  });
});
