import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
  rating: number;
  reviews: Review[];
  discount?: number;
}

interface ProductsState {
  items: Product[];
  categories: string[];
  loading: boolean;
  error: string | null;
  selectedCategory: string | null;
  searchQuery: string;
}

const initialState: ProductsState = {
  items: [],
  categories: [],
  loading: false,
  error: null,
  selectedCategory: null,
  searchQuery: '',
};

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.items = action.payload;
      state.categories = [...new Set(action.payload.map(product => product.category))];
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string | null>) => {
      state.selectedCategory = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    addReview: (state, action: PayloadAction<{ productId: string; review: Review }>) => {
      const product = state.items.find(p => p.id === action.payload.productId);
      if (product) {
        product.reviews.push(action.payload.review);
        product.rating = product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length;
      }
    },
  },
});

export const {
  setProducts,
  setLoading,
  setError,
  setSelectedCategory,
  setSearchQuery,
  addReview,
} = productsSlice.actions;

export default productsSlice.reducer; 