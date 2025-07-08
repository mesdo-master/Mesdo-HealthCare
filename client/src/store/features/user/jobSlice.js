import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../../lib/axio";




const initialState = {
    currentJobOrganisationData:null
};

const jobSlice = createSlice({
    name: "job",
    initialState,
    reducers: {
        setCurrentJobOrganisationData: (state, action) => {
            state.currentJobOrganisationData = action.payload;
        }
    },
    extraReducers: (builder) => {},
});

// Export actions
export const { setCurrentJobOrganisationData } = jobSlice.actions;
export default jobSlice.reducer;
