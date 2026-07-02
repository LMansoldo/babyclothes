defmodule Api.Workers.GrowthCheckWorkerTest do
  use Api.DataCase, async: true

  alias Api.Workers.GrowthCheckWorker

  describe "perform/1 with child_id" do
    test "returns error when child not found" do
      job = %Oban.Job{args: %{"child_id" => 999_999}, queue: "growth"}
      assert {:error, :child_not_found} = GrowthCheckWorker.perform(job)
    end

    test "handles connection error when agents unavailable" do
      user = insert(:user)
      child = insert(:child, user: user, name: "Sofia", birth_date: ~D[2023-01-15])
      insert(:measurement, child: child, recorded_at: DateTime.utc_now())

      job = %Oban.Job{args: %{"child_id" => child.id}, queue: "growth"}
      result = GrowthCheckWorker.perform(job)
      assert match?({:error, _}, result)
    end
  end

  describe "perform/1 with check_all" do
    test "enqueues individual jobs for children with measurements" do
      user = insert(:user)
      child = insert(:child, user: user)
      insert(:measurement, child: child, recorded_at: DateTime.utc_now())

      job = %Oban.Job{args: %{"check_all" => true}, queue: "growth"}
      assert :ok = GrowthCheckWorker.perform(job)
    end

    test "ignores children without measurements" do
      user = insert(:user)
      insert(:child, user: user)

      job = %Oban.Job{args: %{"check_all" => true}, queue: "growth"}
      assert :ok = GrowthCheckWorker.perform(job)
    end
  end

  describe "schedule/1" do
    test "inserts job into growth queue" do
      assert {:ok, %Oban.Job{queue: "growth"}} = GrowthCheckWorker.schedule(1)
    end
  end
end
