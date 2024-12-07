declare module 'react-instantsearch' {
    export function RangeInput(props: RangeInputProps): ReactNode;
    export function SortBy(props: SortByProps): ReactNode;
    export function InstantSearch(props: InstantSearchProps): ReactNode;
    export function SearchBox(props: SearchBoxProps): ReactNode;
    export function Configure(props: ConfigureProps): ReactNode;
    export function Hits(props: HitsProps): ReactNode;
    export function useInstantSearch(): InstantSearchApi<TUiState>;
}  


// For Next.js library
declare module 'react-instantsearch-nextjs' {
    export function InstantSearchNext(props: InstantSearchNextProps): ReactNode;
}
