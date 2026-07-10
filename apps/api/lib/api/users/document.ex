defmodule Api.Users.Document do
  @moduledoc """
  Validation for Brazilian identity documents (CPF and CNPJ).

  Both functions expect digits only (no punctuation). They check length,
  reject repeated-digit sequences and verify both check digits.
  """

  @cnpj_weights_first [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  @cnpj_weights_second [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

  @doc "Returns true when the string is a checksum-valid, 11-digit CPF."
  @spec valid_cpf?(String.t()) :: boolean()
  def valid_cpf?(value) when is_binary(value) do
    case parse_digits(value, 11) do
      {:ok, digits} -> not repeated?(digits) and cpf_verifiers_match?(digits)
      _ -> false
    end
  end

  def valid_cpf?(_value), do: false

  @doc "Returns true when the string is a checksum-valid, 14-digit CNPJ."
  @spec valid_cnpj?(String.t()) :: boolean()
  def valid_cnpj?(value) when is_binary(value) do
    case parse_digits(value, 14) do
      {:ok, digits} -> not repeated?(digits) and cnpj_verifiers_match?(digits)
      _ -> false
    end
  end

  def valid_cnpj?(_value), do: false

  defp parse_digits(value, expected_length) do
    case Regex.match?(~r/^\d{#{expected_length}}$/, value) do
      true -> {:ok, value |> String.graphemes() |> Enum.map(&String.to_integer/1)}
      false -> :error
    end
  end

  defp repeated?(digits) do
    digits |> Enum.uniq() |> length() == 1
  end

  defp cpf_verifiers_match?(digits) do
    {base, [first_dv, second_dv]} = Enum.split(digits, 9)
    first = cpf_digit(base, 10)
    second = cpf_digit(base ++ [first], 11)
    first == first_dv and second == second_dv
  end

  defp cpf_digit(digits, initial_weight) do
    digits
    |> Enum.with_index()
    |> Enum.reduce(0, fn {digit, index}, acc -> acc + digit * (initial_weight - index) end)
    |> verifier_from_sum()
  end

  defp cnpj_verifiers_match?(digits) do
    {base, [first_dv, second_dv]} = Enum.split(digits, 12)
    first = cnpj_digit(base, @cnpj_weights_first)
    second = cnpj_digit(base ++ [first], @cnpj_weights_second)
    first == first_dv and second == second_dv
  end

  defp cnpj_digit(digits, weights) do
    digits
    |> Enum.zip(weights)
    |> Enum.reduce(0, fn {digit, weight}, acc -> acc + digit * weight end)
    |> verifier_from_sum()
  end

  defp verifier_from_sum(sum) do
    case rem(sum, 11) do
      remainder when remainder < 2 -> 0
      remainder -> 11 - remainder
    end
  end
end
