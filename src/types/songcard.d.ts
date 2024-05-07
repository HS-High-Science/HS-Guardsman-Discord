declare module "songcard" {
    export async function classicCard({ imageBg: string, imageText: string, trackStream: boolean, trackDuration: number, trackTotalDuration: number }): Promise<Buffer>;
    export async function simpleCard({ imageBg: string, imageText: string }): Promise<Buffer>;
}