from app.optimizer import Asset, brute_force, dynamic_programming

def sample_assets():
    return [
        Asset("Index Fund", 420, 82),
        Asset("Treasury Bonds", 240, 38),
        Asset("Growth Equity", 360, 76),
        Asset("Dividend Fund", 290, 53),
    ]

def test_both_algorithms_return_same_best_value():
    assets = sample_assets()
    assert brute_force(assets, 800)[0] == dynamic_programming(assets, 800)[0] == 158

def test_budget_is_not_exceeded():
    assets = sample_assets()
    value, chosen = dynamic_programming(assets, 800)
    assert sum(assets[i].cost for i in chosen) <= 800
    assert value == 158

def test_zero_budget():
    assert dynamic_programming(sample_assets(), 0) == (0, [])

def test_asset_over_budget_is_skipped():
    assert dynamic_programming([Asset("Expensive", 500, 100)], 100) == (0, [])

def test_empty_asset_value_is_valid():
    assert dynamic_programming([Asset("No return", 10, 0)], 10)[0] == 0
