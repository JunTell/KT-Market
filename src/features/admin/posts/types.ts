export interface Post {
    id: string;
    created_at: string;
    updated_at: string | null;
    title: string;
    content: string;
    thumbnail: string | null;
    is_published: boolean;
    view_count: number;
    author_id: string;
}

export interface PostFormData {
    title: string;
    content: string;
    thumbnail?: string;
    is_published: boolean;
}
