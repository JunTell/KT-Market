export type ActionState<T = void> = {
    success: boolean
    data?: T
    error?: string
}
