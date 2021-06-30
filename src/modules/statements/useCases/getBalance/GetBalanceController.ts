import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { Mapper } from '../../mappers/Mapper';
import { GetBalanceUseCase } from './GetBalanceUseCase';

export class GetBalanceController {
  async execute(request: Request, response: Response) {
    const { id: user_id } = request.user;

    const getBalance = container.resolve(GetBalanceUseCase);

    const balance = await getBalance.execute({ user_id });

    const balanceDTO = Mapper.balanceToDTO(balance);

    return response.json(balanceDTO);
  }
}
