module instantrent_core::stream {
    use std::string::{Self, String};
    use sui::event;

    public struct Lease has key, store {
        id: UID,
        landlord: address,
        tenant: address,
        unit: String,
        monthly_rent_usd: u64,
        funded_through_ms: u64,
        created_at_ms: u64,
    }

    public struct TopUpReceipt has key, store {
        id: UID,
        lease_id: String,
        tenant: address,
        hours: u64,
        payment_mist: u64,
        funded_at_ms: u64,
    }

    public struct LeaseCreated has copy, drop {
        lease_id: ID,
        landlord: address,
        tenant: address,
    }

    public struct LeaseToppedUp has copy, drop {
        receipt_id: ID,
        tenant: address,
        hours: u64,
        payment_mist: u64,
    }

    public entry fun start_lease(
        landlord: address,
        unit: vector<u8>,
        monthly_rent_usd: u64,
        initial_funded_through_ms: u64,
        clock: &sui::clock::Clock,
        ctx: &mut TxContext,
    ) {
        let tenant = tx_context::sender(ctx);
        let lease = Lease {
            id: object::new(ctx),
            landlord,
            tenant,
            unit: string::utf8(unit),
            monthly_rent_usd,
            funded_through_ms: initial_funded_through_ms,
            created_at_ms: sui::clock::timestamp_ms(clock),
        };
        let lease_id = object::id(&lease);
        event::emit(LeaseCreated { lease_id, landlord, tenant });
        transfer::public_transfer(lease, tenant);
    }

    public entry fun top_up_demo(
        lease_id: vector<u8>,
        hours: u64,
        payment_mist: u64,
        clock: &sui::clock::Clock,
        ctx: &mut TxContext,
    ) {
        let tenant = tx_context::sender(ctx);
        let receipt = TopUpReceipt {
            id: object::new(ctx),
            lease_id: string::utf8(lease_id),
            tenant,
            hours,
            payment_mist,
            funded_at_ms: sui::clock::timestamp_ms(clock),
        };
        let receipt_id = object::id(&receipt);
        event::emit(LeaseToppedUp { receipt_id, tenant, hours, payment_mist });
        transfer::public_transfer(receipt, tenant);
    }
}
