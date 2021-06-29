import { Router } from 'express';

import { TransferController } from '../modules/statements/useCases/transfer/TransferController';
import { CreateStatementController } from '../modules/statements/useCases/createStatement/CreateStatementController';
import { GetBalanceController } from '../modules/statements/useCases/getBalance/GetBalanceController';
import { GetStatementOperationController } from '../modules/statements/useCases/getStatementOperation/GetStatementOperationController';
import { ensureAuthenticated } from '../shared/infra/http/middlwares/ensureAuthenticated';

const statementRouter = Router();
const getBalanceController = new GetBalanceController();
const createStatementController = new CreateStatementController();
const getStatementOperationController = new GetStatementOperationController();
const transferController = new TransferController();

statementRouter.use(ensureAuthenticated);

statementRouter.get('/balance', getBalanceController.execute);

statementRouter.post('/deposit', createStatementController.execute);
statementRouter.post('/withdraw', createStatementController.execute);
statementRouter.post('/transfer/:user_id', transferController.handle);

statementRouter.get('/:statement_id', getStatementOperationController.execute);

export { statementRouter };
