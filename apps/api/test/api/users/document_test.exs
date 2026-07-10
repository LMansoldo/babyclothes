defmodule Api.Users.DocumentTest do
  use ExUnit.Case, async: true

  alias Api.Users.Document

  describe "valid_cpf?/1" do
    test "accepts CPFs with correct verifier digits" do
      assert Document.valid_cpf?("52998224725")
      assert Document.valid_cpf?("11144477735")
      assert Document.valid_cpf?("12345678909")
    end

    test "rejects CPFs with wrong verifier digits" do
      refute Document.valid_cpf?("12345678900")
      refute Document.valid_cpf?("52998224726")
    end

    test "rejects repeated-digit sequences" do
      refute Document.valid_cpf?("11111111111")
      refute Document.valid_cpf?("00000000000")
    end

    test "rejects wrong length and non-digit input" do
      refute Document.valid_cpf?("5299822472")
      refute Document.valid_cpf?("529982247251")
      refute Document.valid_cpf?("529.982.247-25")
      refute Document.valid_cpf?("")
    end
  end

  describe "valid_cnpj?/1" do
    test "accepts CNPJs with correct verifier digits" do
      assert Document.valid_cnpj?("11222333000181")
      assert Document.valid_cnpj?("11444777000161")
      assert Document.valid_cnpj?("45399755000149")
    end

    test "rejects CNPJs with wrong verifier digits" do
      refute Document.valid_cnpj?("11222333000180")
    end

    test "rejects repeated-digit sequences" do
      refute Document.valid_cnpj?("11111111111111")
    end

    test "rejects wrong length and non-digit input" do
      refute Document.valid_cnpj?("1122233300018")
      refute Document.valid_cnpj?("11.222.333/0001-81")
      refute Document.valid_cnpj?("")
    end
  end
end
