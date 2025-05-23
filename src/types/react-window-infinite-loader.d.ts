declare module 'react-window-infinite-loader' {
  import React, { ComponentType } from 'react';

  export interface InfiniteLoaderProps {
    children: (props: {
      onItemsRendered: (props: {
        overscanStartIndex: number;
        overscanStopIndex: number;
        startIndex: number;
        stopIndex: number;
        visibleStartIndex: number;
        visibleStopIndex: number;
      }) => void;
      ref: (ref: any) => void;
    }) => React.ReactNode;
    isItemLoaded: (index: number) => boolean;
    itemCount: number;
    loadMoreItems: (startIndex: number, stopIndex: number) => Promise<any> | void;
    threshold?: number;
    minimumBatchSize?: number;
  }

  const InfiniteLoader: ComponentType<InfiniteLoaderProps>;
  export default InfiniteLoader;
}
