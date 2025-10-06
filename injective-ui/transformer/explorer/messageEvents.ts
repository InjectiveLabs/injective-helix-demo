import { type EventLog } from '@injectivelabs/sdk-ts'
import { EventMessageType } from './../../types'

export const eventLogsSummaryMap: Partial<
  Record<
    EventMessageType,
    ({
      args,
      logs,
      sender
    }: {
      args: any
      logs: EventLog[]
      sender: string
    }) => string | undefined
  >
> = {
  [EventMessageType.CancelSpotOrder]: ({ args, logs, sender }) => {
    const orderHashInBase64 = Buffer.from(args.slice(2), 'hex').toString(
      'base64'
    )

    try {
      const parsedEvents = logs
        .flatMap(({ events }) => events)
        .filter(
          ({ type, attributes }) =>
            type === 'injective.exchange.v1beta1.EventCancelSpotOrder' &&
            attributes.some(({ key, value }) => {
              if (key === 'order') {
                const parsedAttribute = JSON.parse(value)

                return (
                  parsedAttribute.order_info.cid === args ||
                  parsedAttribute.order_hash === orderHashInBase64
                )
              }

              return undefined
            })
        )

      const spotOrder = parsedEvents[0].attributes.find(
        ({ key }) => key === 'order'
      )
      const marketId = JSON.parse(
        parsedEvents[0].attributes.find(({ key }) => key === 'market_id')
          ?.value || ''
      )

      const { order_info: order, order_type: orderType } = JSON.parse(
        spotOrder?.value || ''
      )

      if (!marketId || !order) {
        return undefined
      }

      return `{{account:${sender}}} cancelled a LIMIT ${orderType} order for {{spotQuantity:${marketId}-${order.quantity}}} at {{spotPrice:${marketId}-${order.price}}} in {{market:${marketId}}}`
    } catch (e: any) {
      return undefined
    }
  },

  [EventMessageType.BatchCancelSpotOrders]: ({ args, logs }) => {
    const orderHashInBase64 = Buffer.from(args.slice(2), 'hex').toString(
      'base64'
    )

    try {
      const parsedEvents = logs
        .flatMap(({ events }) => events)
        .filter(
          ({ type, attributes }) =>
            type === 'injective.exchange.v1beta1.EventCancelSpotOrder' &&
            attributes.some(({ key, value }) => {
              if (key === 'order') {
                const parsedAttribute = JSON.parse(value)

                return (
                  parsedAttribute.order_info.cid === args ||
                  parsedAttribute.order_hash === orderHashInBase64
                )
              }

              return undefined
            })
        )

      const spotOrder = parsedEvents[0].attributes.find(
        ({ key }) => key === 'order'
      )

      const marketId = JSON.parse(
        parsedEvents[0].attributes.find(({ key }) => key === 'market_id')
          ?.value || ''
      )

      const { order_info: order, order_type: orderType } = JSON.parse(
        spotOrder?.value || ''
      )

      if (!marketId || !order) {
        return undefined
      }

      return `cancelled a LIMIT ${orderType} order for {{spotQuantity:${marketId}-${order.quantity}}} at {{spotPrice:${marketId}-${order.price}}} in {{market:${marketId}}}`
    } catch (e: any) {
      return undefined
    }
  },

  [EventMessageType.CancelDerivativeOrder]: ({ args, logs, sender }) => {
    const orderHashInBase64 = Buffer.from(args.slice(2), 'hex').toString(
      'base64'
    )

    try {
      const parsedEvents = logs
        .flatMap(({ events }) => events)
        .filter(
          ({ type, attributes }) =>
            [
              'injective.exchange.v1beta1.EventCancelDerivativeOrder',
              'injective.exchange.v1beta1.EventCancelConditionalDerivativeOrder'
            ].includes(type) &&
            attributes.some(({ key, value }) => {
              if (key === 'limit_order' || key === 'market_order') {
                if (!value || value === 'null') {
                  return false
                }

                const parsedAttribute = JSON.parse(value)

                return (
                  parsedAttribute.order_info.cid === args ||
                  parsedAttribute.order_hash === orderHashInBase64
                )
              }

              return undefined
            })
        )

      const derivativeOrder = parsedEvents[0].attributes.find(
        ({ key, value }) =>
          value &&
          value !== 'null' &&
          ['limit_order', 'market_order'].includes(key)
      )

      const marketId = JSON.parse(
        parsedEvents[0].attributes.find(({ key }) => key === 'market_id')
          ?.value || ''
      )

      const { order_info: order, order_type: orderType } = JSON.parse(
        derivativeOrder?.value || ''
      )

      if (!marketId || !order) {
        return undefined
      }

      return `{{account:${sender}}} cancelled a LIMIT ${orderType} order for {{derivativeQuantity:${marketId}-${order.quantity}}} at {{derivativePrice:${marketId}-${order.price}}} in {{market:${marketId}}}`
    } catch (e: any) {
      return undefined
    }
  },

  [EventMessageType.BatchCancelDerivativeOrders]: ({ args, logs }) => {
    const orderHashInBase64 = Buffer.from(args.slice(2), 'hex').toString(
      'base64'
    )

    try {
      const parsedEvents = logs
        .flatMap(({ events }) => events)
        .filter(
          ({ type, attributes }) =>
            [
              'injective.exchange.v1beta1.EventCancelDerivativeOrder',
              'injective.exchange.v1beta1.EventCancelConditionalDerivativeOrder'
            ].includes(type) &&
            attributes.some(({ key, value }) => {
              if (key === 'limit_order' || key === 'market_order') {
                if (!value || value === 'null') {
                  return false
                }

                const parsedAttribute = JSON.parse(value)

                return (
                  parsedAttribute.order_info.cid === args ||
                  parsedAttribute.order_hash === orderHashInBase64
                )
              }

              return undefined
            })
        )

      const derivativeOrder = parsedEvents[0].attributes.find(
        ({ key, value }) =>
          value &&
          value !== 'null' &&
          ['limit_order', 'market_order'].includes(key)
      )

      const marketId = JSON.parse(
        parsedEvents[0].attributes.find(({ key }) => key === 'market_id')
          ?.value || ''
      )

      const { order_info: order, order_type: orderType } = JSON.parse(
        derivativeOrder?.value || ''
      )

      if (!marketId || !order) {
        return undefined
      }

      return `cancelled a LIMIT ${orderType} order for {{derivativeQuantity:${marketId}-${order.quantity}}} at {{derivativePrice:${marketId}-${order.price}}} in {{market:${marketId}}}`
    } catch (e: any) {
      return undefined
    }
  }
}
