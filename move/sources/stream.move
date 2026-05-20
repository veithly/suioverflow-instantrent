module instantrent_core::stream {
    use sui::event;

    /// One rental cash-flow stream between tenant and landlord.
    public struct Lease has key, store {
        id: UID,
        landlord: address,
        tenant: address,
        rate_mist_per_second: u64,
        funded_through_ms: u64,
        started_at_ms: u64,
        sold: bool,
    }

    public struct LeaseCreated has copy, drop { lease_id: ID, landlord: address, tenant: address }
    public struct LeaseToppedUp has copy, drop { lease_id: ID, new_funded_through_ms: u64 }
    public struct LeaseSold has copy, drop { lease_id: ID, lender: address, payout_mist: u64 }

    public entry fun start_lease(
        landlord: address,
        tenant: address,
        rate_mist_per_second: u64,
        clock: &sui::clock::Clock,
        ctx: &mut TxContext,
    ) {
        let started = sui::clock::timestamp_ms(clock);
        let lease = Lease {
            id: object::new(ctx),
            landlord,
            tenant,
            rate_mist_per_second,
            funded_through_ms: started,
            started_at_ms: started,
            sold: false,
        };
        event::emit(LeaseCreated { lease_id: object::id(&lease), landlord, tenant });
        transfer::share_object(lease);
    }

    public entry fun top_up(lease: &mut Lease, extend_ms: u64) {
        lease.funded_through_ms = lease.funded_through_ms + extend_ms;
        event::emit(LeaseToppedUp { lease_id: object::id(lease), new_funded_through_ms: lease.funded_through_ms });
    }

    public entry fun sell_stream(lease: &mut Lease, lender: address, payout_mist: u64) {
        assert!(!lease.sold, 0);
        lease.sold = true;
        event::emit(LeaseSold { lease_id: object::id(lease), lender, payout_mist });
    }
}
