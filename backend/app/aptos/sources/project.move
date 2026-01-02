module pred::PredefinedSumContract {
    use std::signer;
    use std::error;

    /// Error codes
    const E_ALREADY_INITIALIZED: u64 = 0;
    const E_NOT_INITIALIZED: u64 = 1;

    /// A predefined constant representing an initial or fixed value.
    const PREDEFINED_INITIAL_SUM: u64 = 100;

    /// Resource to store the sum for a given account.
    struct AccountSum has key {
        current_sum: u64,
    }

    /// Initializes the `AccountSum` resource for the calling account
    /// with the `PREDEFINED_INITIAL_SUM`.
    ///
    /// The account that calls this function will be the owner of the `AccountSum` resource.
    public entry fun initialize(account: &signer) {
        let account_addr = signer::address_of(account);
        // Ensure the resource doesn't already exist for this account.
        assert!(!exists<AccountSum>(account_addr), error::already_exists(E_ALREADY_INITIALIZED));

        // Move the new AccountSum resource, initialized with the predefined value,
        // to the calling account's address.
        move_to(account, AccountSum { current_sum: PREDEFINED_INITIAL_SUM });
    }

    /// Adds a given value to the `current_sum` stored in the `AccountSum` resource
    /// owned by the calling account.
    ///
    /// This function requires the `AccountSum` resource to be already initialized
    /// for the calling account.
    public entry fun add_to_sum(account: &signer, value_to_add: u64) acquires AccountSum {
        let account_addr = signer::address_of(account);
        // Ensure the resource exists for this account.
        assert!(exists<AccountSum>(account_addr), error::not_found(E_NOT_INITIALIZED));

        // Borrow a mutable reference to the AccountSum resource.
        let account_sum_ref = borrow_global_mut<AccountSum>(account_addr);

        // Add the new value to the current sum.
        account_sum_ref.current_sum = account_sum_ref.current_sum + value_to_add;
    }

    /// Retrieves the current sum stored in the `AccountSum` resource for a given address.
    ///
    /// This is a public view function that does not modify state.
    public fun get_current_sum(owner_address: address): u64 acquires AccountSum {
        // Ensure the resource exists for the given address.
        assert!(exists<AccountSum>(owner_address), error::not_found(E_NOT_INITIALIZED));

        // Borrow an immutable reference to the AccountSum resource and return its current_sum.
        borrow_global<AccountSum>(owner_address).current_sum
    }

    /// Retrieves the predefined initial sum.
    /// This is a pure function that does not interact with state.
    public fun get_predefined_initial_sum(): u64 {
        PREDEFINED_INITIAL_SUM
    }
}