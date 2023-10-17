import {createWithEqualityFn} from "zustand/traditional";

type State = {
    pageNumber: number;
    pageSize: number;
    pageCount: number;
    searchTerm: string;
    searchValue: string;
    orderBy: string;
    filterBy: string;
    seller?: string;
    winner?: string;
}

type Action = {
    setParams: (params: Partial<State>) => void;
    reset: () => void;
    setSearchValue: (value: string) => void;
}

const initialState: State = {
    pageNumber: 1,
    pageSize: 12,
    pageCount: 1,
    searchTerm: '',
    searchValue: '',
    orderBy: 'make',
    filterBy: 'live',
    seller: undefined,
    winner: undefined
}

export const useParamsStore = createWithEqualityFn<State & Action>()((set) => ({
    ...initialState,
    setParams: (newParams) =>
        set((state) => {
            if (newParams.pageNumber) {
                return {...state, pageNumber: newParams.pageNumber}
            }
            return {...state, ...newParams, pageNumber: 1}
        }),
    reset: () => set(initialState),
    setSearchValue: (value) => set({searchValue: value})
}))