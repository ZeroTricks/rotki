import { type ActionResult } from '@rotki/common/lib/data';
import { axiosSnakeCaseTransformer } from '@/services/axios-tranformers';
import { type OracleCacheMeta } from '@/services/balances/types';
import { api } from '@/services/rotkehlchen-api';
import { type PendingTask } from '@/services/types-api';
import {
  handleResponse,
  paramsSerializer,
  validStatus,
  validWithSessionAndExternalService,
  validWithoutSessionStatus
} from '@/services/utils';
import { type SupportedCurrency } from '@/types/currencies';
import { type PriceOracle } from '@/types/price-oracle';

export const usePriceApi = () => {
  const createPriceCache = async (
    source: PriceOracle,
    fromAsset: string,
    toAsset: string,
    purgeOld = false
  ): Promise<PendingTask> =>
    api.instance
      .post<ActionResult<PendingTask>>(
        `/oracles/${source}/cache`,
        axiosSnakeCaseTransformer({
          asyncQuery: true,
          purgeOld: purgeOld ? purgeOld : undefined,
          fromAsset,
          toAsset
        }),
        {
          validateStatus: validWithSessionAndExternalService
        }
      )
      .then(handleResponse);

  const deletePriceCache = async (
    source: PriceOracle,
    fromAsset: string,
    toAsset: string
  ): Promise<boolean> =>
    api.instance
      .delete<ActionResult<boolean>>(`/oracles/${source}/cache`, {
        data: axiosSnakeCaseTransformer({
          fromAsset,
          toAsset
        }),
        validateStatus: validStatus
      })
      .then(handleResponse);

  const getPriceCache = async (
    source: PriceOracle
  ): Promise<OracleCacheMeta[]> =>
    api.instance
      .get<ActionResult<OracleCacheMeta[]>>(`/oracles/${source}/cache`, {
        validateStatus: validWithSessionAndExternalService
      })
      .then(handleResponse);

  const queryHistoricalRate = (
    fromAsset: string,
    toAsset: string,
    timestamp: number
  ): Promise<PendingTask> =>
    api.instance
      .post<ActionResult<PendingTask>>(
        '/assets/prices/historical',
        axiosSnakeCaseTransformer({
          asyncQuery: true,
          assetsTimestamp: [[fromAsset, timestamp]],
          targetAsset: toAsset
        }),
        {
          validateStatus: validWithSessionAndExternalService
        }
      )
      .then(handleResponse);

  const queryPrices = async (
    assets: string[],
    targetAsset: string,
    ignoreCache: boolean
  ): Promise<PendingTask> =>
    api.instance
      .post<ActionResult<PendingTask>>(
        '/assets/prices/latest',
        axiosSnakeCaseTransformer({
          asyncQuery: true,
          assets: assets.join(','),
          targetAsset,
          ignoreCache: ignoreCache ? ignoreCache : undefined
        }),
        {
          validateStatus: validWithSessionAndExternalService
        }
      )
      .then(handleResponse);

  async function queryFiatExchangeRates(
    currencies: SupportedCurrency[]
  ): Promise<PendingTask> {
    const response = await api.instance.get<ActionResult<PendingTask>>(
      '/exchange_rates',
      {
        params: {
          async_query: true,
          currencies
        },
        paramsSerializer,
        validateStatus: validWithoutSessionStatus
      }
    );

    return handleResponse(response);
  }

  return {
    queryPrices,
    queryFiatExchangeRates,
    queryHistoricalRate,
    getPriceCache,
    createPriceCache,
    deletePriceCache
  };
};
