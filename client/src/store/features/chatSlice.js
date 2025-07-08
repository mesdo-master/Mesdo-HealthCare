// frontend/src/redux/chatSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../lib/axio';


// Fetch conversations for the logged in user
export const fetchConversations = createAsyncThunk('chat/fetchConversations', async (userId, { rejectWithValue }) => {
    try {
        const res = await axiosInstance.get(`/conversations/${userId}`);
        return res.data;
    } catch (error) {
        return rejectWithValue(error);
    }
});

// Fetch messages for a specific conversation
export const fetchMessages = createAsyncThunk('chat/fetchMessages', async (conversationId,{rejectWithValue}) => {
    try {
        const res = await axiosInstance.get(`/messages/${conversationId}`);
        return res.data;
    } catch (error) {
        return rejectWithValue(error);
    }
});

export const chatSlice = createSlice({
    name: 'chat',
    initialState: {
        conversations: [],
        messages: [],
    },
    reducers: {
        addMessage: (state, action) => {
            state.messages.push(action.payload);
        },
        resetMessages: (state) => {
            state.messages = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchConversations.fulfilled, (state, action) => {
                state.conversations = action.payload;
            })
            .addCase(fetchMessages.fulfilled, (state, action) => {
                state.messages = action.payload;
            });
    },
});

export const { addMessage, resetMessages } = chatSlice.actions;
export default chatSlice.reducer;
