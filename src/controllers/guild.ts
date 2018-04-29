import { Request, Response } from 'express'
import { controller, httpGet, httpDelete, httpPut, httpPost } from 'inversify-express-utils'
import { inject } from 'inversify'
import { Types, Events } from '../constants'
import { GuildService } from '../services/guild'
import { SocketService } from '../services/socket'
import { BaseController } from '../interfaces/BaseController'
import { Guild } from '@natsuki/db'
import { Logger } from '@natsuki/util'

/**
 * The Guild controller. Contains all endpoints for handling Guilds and Guild data.
 *
 * /api/guilds
 * @class GuildController
 */
@controller('/api/guilds')
export class GuildController implements BaseController<Guild> {
  constructor (
    @inject(Types.GuildService) private guildService: GuildService,
    @inject(Types.SocketService) private socketService: SocketService
  ) {}

  /**
   * Gets all guilds from the database, excluding most guild information.
   *
   * GET /
   * @param {Request} request
   * @param {Response} response
   * @returns Promise<Guild[]>
   * @memberof GuildController
   */
  @httpGet('/')
  async getAll (request: Request, response: Response) {
    return this.guildService.getAll()
  }

  /**
   * Gets a guild by their ID, including all guild information.
   *
   * GET /:id
   * @param {Request} request
   * @param {Response} response
   * @returns Promise<Guild>
   * @memberof GuildController
   */
  @httpGet('/:id')
  async findById (request: Request, response: Response) {
    return this.guildService.findById(request.params.id)
  }

  /**
   * Creates a guild.
   *
   * POST /
   * @param {Request} request
   * @param {Response} response
   * @returns Promise<Guild>
   * @memberof GuildController
   */
  @httpPost('/')
  async create (request: Request, response: Response) {
    const guildResponse = this.guildService.create(request.body)
    await guildResponse.then(guild => {
      this.socketService.send(Events.guild.created, guild)
    }).catch((err: any) => {
      Logger.error(err)
    })

    return guildResponse
  }

  /**
   * Hard deletes a guild.
   *
   * DELETE /:id
   * @param {Request} request
   * @param {Response} response
   * @returns Promise<void>
   * @memberof GuildController
   */
  @httpDelete('/:id')
  async deleteById (request: Request, response: Response) {
    const deleteResponse = this.guildService.deleteById(request.params.id)
    await deleteResponse.then(() => {
      this.socketService.send(Events.guild.deleted, request.params.id)
    }).catch((err: any) => {
      Logger.error(err)
    })

    return deleteResponse
  }

  /**
   * Updates a guild by ID.
   *
   * PUT /:id
   * @param {Request} request
   * @param {Response} response
   * @returns Promise<void>
   * @memberof GuildController
   */
  @httpPut('/:id')
  async updateById (request: Request, response: Response) {
    const updateResponse = this.guildService.updateById(request.params.id, request.body)
    await updateResponse.then(() => {
      const returnObject: Guild = request.body
      returnObject.id = request.params.id
      this.socketService.send(Events.guild.updated, returnObject)
    }).catch((err: any) => {
      Logger.error(err)
    })

    return updateResponse
  }

  /**
   * Gets all suggestions in a Guild
   *
   * GET /:id/suggestions
   * @param request
   * @param response
   */
  @httpGet('/:id/suggestions')
  async getSuggestions (request: Request, response: Response) {
    return this.guildService.getSuggestions(request.params.id)
  }

  /**
   * Gets a Guild suggestion by ID.
   *
   * GET /:id/suggestions/:suggestionId
   * @param request
   * @param response
   */
  @httpGet('/:id/suggestions/:suggestionId')
  async getSuggestionById (request: Request, response: Response) {
    return this.guildService.getSuggestionById(request.params.id, request.body)
  }

  /**
   * Creates a suggestion in a Guild
   *
   * POST /:id/suggestions
   * @param request
   * @param response
   */
  @httpPost('/:id/suggestions')
  async createSuggestion (request: Request, response: Response) {
    const postResponse = this.guildService.createSuggestion(request.params.id, request.body)
    await postResponse.then(item => {
      this.socketService.send(Events.guild.suggestion.created, item)
    }).catch((err: any) => {
      Logger.error(err)
    })

    return postResponse
  }

  /**
   * Updates a Guild suggestion by ID.
   *
   * PUT /:id/suggestions/:suggestionId
   * @param request
   * @param response
   */
  @httpPut('/:id/suggestions/:suggestionId')
  async updateSuggestionById (request: Request, response: Response) {
    const updateResponse = this.guildService.updateSuggestion(request.params.id, request.body)
    await updateResponse.then(() => {
      const returnObject: Guild = request.body
      returnObject.id = request.params.id
      this.socketService.send(Events.guild.suggestion.updated, returnObject)
    }).catch((err: any) => {
      Logger.error(err)
    })

    return updateResponse
  }

  /**
   * Deletes a Guild suggestion by ID.
   *
   * DELETE /:id/suggestions/:suggestionId
   * @param request
   * @param response
   */
  @httpDelete('/:id/suggestions/:suggestionId')
  async deleteSuggestionById (request: Request, response: Response) {
    const deleteResponse = this.guildService.deleteSuggestion(request.params.id, request.body)
    await deleteResponse.then(() => {
      this.socketService.send(Events.guild.suggestion.deleted, { guildId: request.params.id, suggestionId: request.body })
    }).catch((err: any) => {
      Logger.error(err)
    })

    return deleteResponse
  }
}
