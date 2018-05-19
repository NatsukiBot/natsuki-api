import { Giveaway } from '@natsuki/db'
import { getRepository } from 'typeorm'
import { provide } from '../ioc/ioc'
import { Types } from '../constants'
import { Logger } from '@natsuki/util'
import { BaseService } from '../interfaces/BaseService'

/**
 * Giveaway service that handles storing and modifying giveaway data.
 *
 * @class GiveawayService
 */
@provide(Types.GiveawayService)
export class GiveawayService implements BaseService<Giveaway> {
  private giveawayRepository = getRepository(Giveaway)

  public getAll () {
    return this.giveawayRepository.find({ relations: ['items'] })
  }

  public async findById (id: string | number) {
    return this.giveawayRepository.findOne(id, { relations: ['items'] })
  }

  public create (giveaway: Giveaway) {
    giveaway.dateCreated = new Date()
    return this.giveawayRepository.save(giveaway)
  }

  public async update (id: string | number, giveaway: Giveaway) {
    return this.giveawayRepository.save(giveaway)
  }

  public async delete (id: string | number) {
    const giveaway = await this.giveawayRepository.findOne(id)

    if (!giveaway) {
      return
    }

    return this.giveawayRepository.remove(giveaway)
  }
}
