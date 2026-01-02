
import PocketBase from 'pocketbase';

// The PocketBase URL provided by the user
export const PB_URL = 'https://pb.srinikb.in';

export const pb = new PocketBase(PB_URL);

// Simple helper to check if user is logged in
export const isAuthenticated = () => pb.authStore.isValid;
export const currentUser = () => pb.authStore.record;
