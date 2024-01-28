/**
* This file was @generated using pocketbase-typegen
*/

export enum Collections {
	Auditlog = "auditlog",
	Hooks = "hooks",
	Posts = "posts",
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

export type AuditlogRecord<Tdata = unknown, Toriginal = unknown> = {
	collection: string
	record: string
	event: string
	user?: RecordIdString
	admin?: string
	data?: null | Tdata
	original?: null | Toriginal
}

export enum HooksEventOptions {
	"insert" = "insert",
	"update" = "update",
	"delete" = "delete",
}

export enum HooksActionTypeOptions {
	"command" = "command",
	"email" = "email",
	"post" = "post",
}
export type HooksRecord = {
	collection: string
	event: HooksEventOptions
	action_type: HooksActionTypeOptions
	action: string
	action_params?: string
	expands?: string
	disabled?: boolean
}

export type PostsRecord = {
	title: string
	body: string
	slug: string
	files?: string[]
	user?: RecordIdString
}

export type UsersRecord = {
	name?: string
	avatar?: string
}

// Response types include system fields and match responses from the PocketBase API
export type AuditlogResponse<Tdata = unknown, Toriginal = unknown> = AuditlogRecord<Tdata, Toriginal> & BaseSystemFields
export type HooksResponse = HooksRecord & BaseSystemFields
export type PostsResponse = PostsRecord & BaseSystemFields
export type UsersResponse = UsersRecord & AuthSystemFields

export type CollectionRecords = {
	auditlog: AuditlogRecord
	hooks: HooksRecord
	posts: PostsRecord
	users: UsersRecord
}