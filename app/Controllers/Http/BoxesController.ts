import { Attachment } from '@ioc:Adonis/Addons/AttachmentLite'
import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { schema, rules } from '@ioc:Adonis/Core/Validator'
import Box from 'App/Models/Box'

export default class BoxesController {

	/**
	 * Retrive a box by its code
	 * @param param HttpContextContract with request and response
	 * @returns The box data or null if not found
	 */
	public async getBox({ request, response }: HttpContextContract) {
		const payload = await request.validate({
			schema: schema.create({
				code: schema.string([rules.escape()])
			})
		})
		const box = await Box.findBy('code', payload.code)

		// If box doesn't exist
		if (!box) {
			response.status(404)
			return {
				error: 'notFound'
			}
		}

		return box
	}

	/**
	 * Save a new box in the database
	 * @param param HttpContextContract with request and response
	 * @returns The new box data
	 */
	public async saveBox({ request, response }: HttpContextContract) {
		const payload = await request.validate({
			schema: schema.create({
				code: schema.string([
					rules.maxLength(180)
				]),
				name: schema.string([
					rules.maxLength(180)
				]),
				registerDate: schema.date({
					format: 'iso'
				}),
				photo: schema.file.optional({
					extnames: ['jpg', 'JPG', 'png', 'PNG', 'gif', 'GIF', 'jpeg', 'JPEG', 'tiff', 'TIFF'],
				})
			})
		})

		// If code is already registered
		if (await Box.findBy('code', payload.code)) {
			response.status(400)
			return {
				error: 'alreadyRegistered'
			}
		}

		const box = await Box.create({
			code: payload.code,
			name: payload.name,
			registerDate: payload.registerDate
		})
		if (payload.photo) {
			box.photo = Attachment.fromFile(payload.photo)
		}

		await box.save()

		return { success: true }
	}

	/**
	 * Delete an existing box
	 * @param param HttpContextContract with request and response
	 * @returns *true* on successfull delete
	 */
	public async deleteBox({ request, response }: HttpContextContract) {
		const payload = await request.validate({
			schema: schema.create({
				code: schema.string()
			})
		})
		const box = await Box.findBy('code', payload.code)

		if (!box) {
			response.status(404)
			return {
				error: 'notFound'
			}
		}

		await box.photo.delete()
		await box.delete()

		return {
			success: true
		}
	}

	/**
	 * Retrive a paginated list of boxes
	 * @param param HttpContextContract with request and response
	 * @returns An array of boxes
	 */
	public async getBoxes({ request }: HttpContextContract) {
		let boxColumns: string[] = []
		Box.$columnsDefinitions.forEach(col => boxColumns = [...boxColumns, col.columnName])
		const payload = await request.validate({
			schema: schema.create({
				page: schema.number([
					/*
					 * This is weird :S it seems that there isn't a rule to set a minimum length
					 * for numbers. maxLength() method is exclusive for strings and Infinity
					 * doesn't work.
					 */
					rules.range(1, 10000000)
				]),
				perPage: schema.number.optional([
					rules.range(1, 10000000)
				]),
				orderBy: schema.enum.optional(boxColumns)
			})
		})

		const boxes = await Box.query().orderBy(payload.orderBy ?? 'registerDate', 'asc').paginate(payload.page, payload.perPage || 10)

		return {
			data: boxes.toJSON().data,
			hasMorePages: boxes.hasMorePages
		}
	}

}
