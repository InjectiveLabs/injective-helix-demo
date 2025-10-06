import { BigNumberInBase } from "@injectivelabs/utils";
import type { TokenStatic } from "@injectivelabs/sdk-ts";
import { sharedTokenClient, tokenStaticFactory } from "../Service";

export const sharedGetToken = async (
  denomOrSymbol: string
): Promise<undefined | TokenStatic> => {
  const token = tokenStaticFactory.toToken(denomOrSymbol);

  if (token) {
    return token
  }

  const asyncToken = await sharedTokenClient.queryToken(denomOrSymbol)

  return asyncToken
};

export const unAbbreviateNumber = (
  value: string,
): BigNumberInBase | undefined => {
  const units = {
    K: Number(`1${"0".repeat(3)}`),
    M: Number(`1${"0".repeat(6)}`),
    B: Number(`1${"0".repeat(9)}`),
    T: Number(`1${"0".repeat(12)}`),
  } as Record<string, number>;

  const unit = value.at(-1);

  if (!unit || !units[unit]) {
    return;
  }

  const formattedValue = value.replaceAll(",", "").slice(0, -1);

  return new BigNumberInBase(formattedValue).multipliedBy(units[unit]);
};

export const abbreviateNumber = (number: number) => {
  const abbreviatedValue = new Intl.NumberFormat("en-US", {
    notation: "compact",
    compactDisplay: "short",
  }).format(number);

  const abbreviatedValueMatchesInput = new BigNumberInBase(number).eq(
    unAbbreviateNumber(abbreviatedValue) || "0",
  );

  return abbreviatedValueMatchesInput
    ? abbreviatedValue
    : `≈${abbreviatedValue}`;
};
