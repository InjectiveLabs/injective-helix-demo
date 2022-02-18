import {
  DerivativeTransformer,
  FundingConsumer,
  FundingPayment
} from '@injectivelabs/derivatives-consumer'
import {
  DerivativeService as BaseDerivativeService,
  ServiceOptions
} from '@injectivelabs/ui-common'

export enum ExtendedDerivativesMetrics {
  FetchFundingPayments = 'FundingPaymentsRequest'
}

export class DerivativeService extends BaseDerivativeService {
  protected fundingConsumer: FundingConsumer

  constructor(options: ServiceOptions) {
    super(options)
    this.fundingConsumer = new FundingConsumer(this.endpoints.exchangeApi)
  }

  async fetchFundingPayments({
    marketId,
    subaccountId
  }: {
    marketId?: string
    subaccountId?: string
  }): Promise<FundingPayment[]> {
    const promise = this.fundingConsumer.fetchFundingPayments({
      marketId,
      subaccountId
    })
    const fundingPayments = await this.fetchOrFetchAndMeasure(
      promise,
      ExtendedDerivativesMetrics.FetchFundingPayments
    )

    return DerivativeTransformer.grpcFundingPaymentsToFundingPayments(
      fundingPayments.getPaymentsList()
    )
  }
}
