export interface Review {
    id: string;
    created_at: string;
    product_id: string | null;
    user_id: string | null;
    rating: number;
    content: string;
    images: string[] | null;
    is_hidden: boolean;
    // Optional relations
    product?: {
        model: string;
        pet_name: string;
    };
    user?: {
        email: string;
    };
}
