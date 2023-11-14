import { DateTime } from 'luxon'
import { BaseModel, column } from '@ioc:Adonis/Lucid/Orm'
import { attachment, AttachmentContract } from '@ioc:Adonis/Addons/AttachmentLite'

export default class Box extends BaseModel {

	public static table = 'boxes'


	@column({ isPrimary: true })
	public id: number

	/**
	 * The unique code of the box. It would corresponds to a barcode.
	 */
	@column()
	public code: string

	/**
	 * A friendly name to recognize the box.
	 */
	@column()
	public name: string

	/**
	 * The registration date of the box, used in order to calculate the expiration date (which is dinamically done).
	 */
	@column.date()
	public registerDate: DateTime

	/**
	 * An optional image file of the box.
	 */
	@attachment()
	public photo: AttachmentContract

	@column.dateTime({ autoCreate: true })
	public createdAt: DateTime

	@column.dateTime({ autoCreate: true, autoUpdate: true })
	public updatedAt: DateTime
}
