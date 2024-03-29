import {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
} from "@reduxjs/toolkit";
import axios from "axios";

export const getCarts = createAsyncThunk("cart/getCarts", async () => {
  const token = localStorage.getItem("user_token");
  const response = await axios.get(
    `${process.env.REACT_APP_API_BASE_URL}/cart`,
    {
      headers: { Authorization: token },
    }
  );
  return response?.data?.data;
});

export const addProduct = createAsyncThunk(
  "cart/addProduct",
  async ({ products_id, quantity }) => {
    const token = localStorage.getItem("user_token");

    const response = await axios.post(
      `${process.env.REACT_APP_API_BASE_URL}/cart`,
      { products_id, quantity },
      { headers: { Authorization: token } }
    );
    return response?.data?.data;
  }
);

export const updateCarts = createAsyncThunk(
  "cart/updateCarts",
  async ({ id, quantity }) => {
    const token = localStorage.getItem("user_token");

    const response = await axios.patch(
      `${process.env.REACT_APP_API_BASE_URL}/cart`,
      { id, quantity },
      { headers: { Authorization: token } }
    );
    return response?.data?.data;
  }
);

export const deleteProduct = createAsyncThunk(
  "carts/deleteProduct",
  async (id) => {
    const token = localStorage.getItem("user_token");

    await axios.delete(`${process.env.REACT_APP_API_BASE_URL}/cart/${id}`, {
      headers: { Authorization: token },
    });
    return id;
  }
);

export const getTotalProductsInCart = (state) => {
  const cartItems = cartSelector.selectAll(state);
  return cartItems.reduce((total, cartItem) => total + cartItem.quantity, 0);
};

export const getTotalPriceInCart = (state) => {
  const cartItems = cartSelector.selectAll(state);
  return cartItems.reduce(
    (total, cartItem) => total + cartItem.quantity * cartItem.product.price,
    0
  );
};

export const getTotalWeightInCart = (state) => {
  const cartItems = cartSelector.selectAll(state);
  return cartItems.reduce(
    (total, cartItem) => total + cartItem.quantity * cartItem.product.weight,
    0
  );
};

const cartEntity = createEntityAdapter({ selectId: (cart) => cart.id });

const cartSlice = createSlice({
  name: "cart",
  initialState: cartEntity.getInitialState(),
  extraReducers: {
    [getCarts.fulfilled]: (state, action) => {
      cartEntity.setAll(state, action.payload);
    },
    [addProduct.fulfilled]: (state, action) => {
      cartEntity.setAll(state, action.payload);
      // action.payload.forEach((cartItem) => {
      //   cartEntity.updateOne(state, {
      //     id: cartItem.id,
      //     changes: cartItem,
      //   });
      // });
    },
    [updateCarts.fulfilled]: (state, action) => {
      cartEntity.setAll(state, action.payload);
      // action.payload.forEach((cartItem) => {
      //   cartEntity.updateOne(state, {
      //     id: cartItem.id,
      //     changes: cartItem,
      //   });
      // });
    },
    [deleteProduct.fulfilled]: (state, action) => {
      cartEntity.removeOne(state, action.payload);
    },
  },
});

export const cartSelector = cartEntity.getSelectors((state) => state.cart);
export default cartSlice.reducer;
