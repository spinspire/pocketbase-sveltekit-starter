/**
* This file was @generated using pocketbase-typegen
*/

export enum Collections {
	Images = "images",
	Posts = "posts",
	Tags = "tags",
	Users = "users",
}

// Alias types for improved usability
export type IsoDateString = string
export type RecordIdString = string

// System fields
export type BaseSystemFields = {
	id: RecordIdString
	created: IsoDateString
	updated: IsoDateString
	collectionId: string
	collectionName: Collections
	expand?: { [key: string]: any }
}

export type AuthSystemFields = {
	email: string
	emailVisibility: boolean
	username: string
	verified: boolean
} & BaseSystemFields

// Record types for each collection

export type ImagesRecord = {
	file?: string
}

export type PostsRecord = {
	title: string
	slug: string
	body: string
	blogSummary?: string
	featuredImage?: RecordIdString
	prompt?: string
	userid?: RecordIdString
	tags?: RecordIdString[]
}

export type TagsRecord = {
	title: string
}

export type UsersRecord = {
	name?: string
	avatar?: string
}

// Response types include system fields and match responses from the PocketBase API
export type ImagesResponse = ImagesRecord & BaseSystemFields
export type PostsResponse = PostsRecord & BaseSystemFields
export type TagsResponse = TagsRecord & BaseSystemFields
export type UsersResponse = UsersRecord & AuthSystemFields

export type CollectionRecords = {
	images: ImagesRecord
	posts: PostsRecord
	tags: TagsRecord
	users: UsersRecord
}