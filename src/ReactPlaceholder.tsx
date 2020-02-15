import * as React from 'react';
import * as placeholders from './placeholders';
import { joinClassNames } from './utils';

export type CommonProps = {
  children: React.ReactElement | null;
  /** pass `true` when the content is ready and `false` when it's loading */
  ready: boolean;
  /** delay in millis to wait when passing from ready to NOT ready */
  delay?: number;
  /** if true, the placeholder will never be rendered again once ready becomes true, even if it becomes false again */
  firstLaunchOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export type PlaceholderProps = CommonProps & {
  // we have a default color, so we can set this as optional
  color?: string;
  showLoadingAnimation?: boolean;
  customPlaceholder?: undefined;
};

export type CustomPlaceholderProps = CommonProps & {
  /** pass any renderable content to be used as placeholder instead of the built-in ones */
  customPlaceholder: React.ReactElement<{ [k: string]: any }> | null;
  type?: undefined;
  rows?: undefined;
  color?: undefined;
  showLoadingAnimation?: undefined;
};

type MediaPlaceholderProps = PlaceholderProps &
  Omit<
    React.ComponentProps<typeof placeholders.media>,
    'color' | 'children'
  > & {
    type: 'media';
  };

type RectPlaceholderProps = PlaceholderProps &
  Omit<React.ComponentProps<typeof placeholders.rect>, 'children'> & {
    type: 'rect';
  };

type RoundPlaceholderProps = PlaceholderProps &
  Omit<
    React.ComponentProps<typeof placeholders.round>,
    'color' | 'children'
  > & {
    type: 'round';
  };

type TextPlaceholderProps = PlaceholderProps &
  Omit<React.ComponentProps<typeof placeholders.text>, 'color' | 'children'> & {
    type: 'text';
  };

type TextRowPlaceholderProps = PlaceholderProps &
  Omit<
    React.ComponentProps<typeof placeholders.textRow>,
    'color' | 'children'
  > & {
    type: 'textRow';
  };

export type Props =
  | MediaPlaceholderProps
  | RectPlaceholderProps
  | RoundPlaceholderProps
  | TextRowPlaceholderProps
  | TextPlaceholderProps
  | CustomPlaceholderProps;

const ReactPlaceholder: React.FC<Props> = ({
  delay = 0,
  type = 'text',
  color = '#CDCDCD',
  ready: readyProp,
  firstLaunchOnly,
  children,
  className,
  showLoadingAnimation,
  customPlaceholder,
  ...rest
}) => {
  const [ready, setReady] = React.useState(readyProp);
  const timeout = React.useRef<null | number>(null);

  const getFiller = (): React.ReactElement | null => {
    const classes = showLoadingAnimation
      ? joinClassNames('show-loading-animation', className)
      : className;

    if (customPlaceholder && React.isValidElement(customPlaceholder)) {
      const mergedCustomClasses = [customPlaceholder.props.className, classes]
        .filter(c => c)
        .join(' ');
      return React.cloneElement(customPlaceholder, {
        className: mergedCustomClasses
      });
    } else if (customPlaceholder) {
      return customPlaceholder;
    }

    const Placeholder = placeholders[type];

    // unsure how to properly get the compiler to conditionally recognize rows
    return (
      <Placeholder
        {...rest}
        color={color}
        rows={(rest as { rows: number }).rows}
        className={classes}
      />
    );
  };

  React.useEffect(() => {
    if (!firstLaunchOnly && ready && !readyProp) {
      if (delay && delay > 0) {
        timeout.current = window.setTimeout(() => {
          setReady(false);
        }, delay);
      } else {
        setReady(false);
      }
    } else if (readyProp) {
      if (timeout.current) {
        window.clearTimeout(timeout.current);
      }

      if (!ready) {
        setReady(true);
      }
    }
  }, [firstLaunchOnly, ready, readyProp, delay]);

  return ready ? children : getFiller();
};

export default ReactPlaceholder;
