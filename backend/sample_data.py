"""Synthetic demo datasets with realistic redundancy, for the Streamlit demo."""

SAMPLE_CODE = '''"""
inventory_service.py
Handles inventory management for the e-commerce backend.
"""

import logging
import json
import time
from datetime import datetime

logger = logging.getLogger(__name__)


def validate_input(data):
    """Validate incoming request data."""
    # check required fields
    if not data:
        raise ValueError("data cannot be empty")
    if "sku" not in data:
        raise ValueError("sku is required")
    return True


def log_request(data):
    """Log the incoming request for auditing."""
    logger.info(f"Received request: {json.dumps(data)}")
    logger.info(f"Timestamp: {datetime.now()}")
    # this is just for debugging, not important
    print("DEBUG: request logged")


class InventoryService:
    """Main service class for inventory operations."""

    def __init__(self, db_connection):
        self.db = db_connection
        self.cache = {}

    def get_stock_level(self, sku):
        """
        Returns current stock level for a given SKU.
        Checks cache first, then falls back to DB.
        """
        if sku in self.cache:
            logger.info(f"Cache hit for {sku}")
            return self.cache[sku]
        # cache miss, hit the db
        logger.info(f"Cache miss for {sku}, querying db")
        result = self.db.query("SELECT stock FROM inventory WHERE sku = ?", [sku])
        if not result:
            raise KeyError(f"SKU {sku} not found")
        self.cache[sku] = result[0]["stock"]
        return self.cache[sku]

    def reserve_stock(self, sku, quantity):
        """
        Reserves `quantity` units of `sku` for an in-progress order.
        Raises InsufficientStockError if not enough stock is available.
        This is the CRITICAL function -- it must be atomic and race-safe,
        because two concurrent orders could both read the same stock level
        and both think there's enough, leading to overselling.
        """
        current = self.get_stock_level(sku)
        if current < quantity:
            raise InsufficientStockError(
                f"Cannot reserve {quantity} of {sku}, only {current} available"
            )
        # Use a DB-level atomic decrement with a WHERE guard so concurrent
        # requests can't both succeed when stock is insufficient.
        updated = self.db.execute(
            "UPDATE inventory SET stock = stock - ? WHERE sku = ? AND stock >= ?",
            [quantity, sku, quantity],
        )
        if updated.rowcount == 0:
            raise InsufficientStockError(
                f"Race condition detected: {sku} stock changed during reservation"
            )
        self.cache.pop(sku, None)  # invalidate cache
        return True

    def release_stock(self, sku, quantity):
        """Releases previously reserved stock back to available pool (e.g. on order cancel)."""
        self.db.execute(
            "UPDATE inventory SET stock = stock + ? WHERE sku = ?",
            [quantity, sku],
        )
        self.cache.pop(sku, None)

    def bulk_import(self, items):
        """Bulk import stock levels from a supplier feed."""
        for item in items:
            validate_input(item)
            log_request(item)
            self.db.execute(
                "INSERT INTO inventory (sku, stock) VALUES (?, ?) "
                "ON CONFLICT(sku) DO UPDATE SET stock = ?",
                [item["sku"], item["stock"], item["stock"]],
            )
            # log again after insert, just to be safe
            logger.info(f"Imported {item['sku']}")
            logger.info(f"Import timestamp: {datetime.now()}")


class InsufficientStockError(Exception):
    """Raised when there isn't enough stock to fulfill a reservation."""
    pass


def format_response(data):
    """Format a response dict for the API layer."""
    return {
        "status": "ok",
        "data": data,
        "timestamp": str(datetime.now()),
    }


def format_error_response(error):
    """Format an error response dict for the API layer."""
    return {
        "status": "error",
        "message": str(error),
        "timestamp": str(datetime.now()),
    }


def health_check():
    """Simple health check endpoint."""
    return {"status": "healthy", "uptime": time.time()}


def another_health_check_alias():
    """Alias for health_check, kept for backwards compatibility."""
    return health_check()


def noop_handler(request):
    """Placeholder handler, does nothing. TODO: remove before v2."""
    pass


def deprecated_get_stock(sku):
    """DEPRECATED: use InventoryService.get_stock_level instead."""
    logger.warning("deprecated_get_stock is deprecated, use InventoryService.get_stock_level")
    return None
'''

SAMPLE_CHAT = """Customer: Hi, I ordered a laptop stand last week and it still hasn't arrived. Order number is 88213.
Agent: Hello! Thanks for reaching out. Let me look into order 88213 for you right away.
Agent: I just wanted to let you know I'm pulling up your account now, please give me one moment.
Customer: Sure, no problem, take your time.
Agent: Okay I can see the order here. It looks like it shipped on the 14th via GroundExpress.
Customer: It's been 9 days though, that seems really long for ground shipping.
Agent: I understand your frustration, and I apologize for the inconvenience this has caused.
Agent: As I mentioned, it shipped on the 14th, and looking at the tracking, there was a delay at the regional hub.
Customer: Okay, is there any update on when it will actually arrive?
Agent: Just to clarify, the tracking shows it left the regional hub yesterday and is now out for delivery in your area.
Agent: Based on the current tracking status, it should arrive within 1-2 business days.
Customer: Alright, thanks. If it doesn't show up by Friday, can I get a refund instead?
Agent: Absolutely, if it hasn't arrived by Friday, please reach back out and we will process a full refund immediately.
Agent: I want to make sure you're taken care of, so please don't hesitate to contact us again.
Customer: Okay sounds good. Also, separate question -- do you sell replacement parts for the stand, like the rubber feet?
Agent: Great question! Let me check that for you.
Agent: I just wanted to let you know I'm checking our parts catalog now, one moment please.
Customer: No worries, thanks for checking.
Agent: Good news, we do sell replacement rubber feet for the laptop stand, they're $4.99 for a set of 4.
Agent: You can find them by searching "laptop stand replacement feet" on our website.
Customer: Perfect, I'll order those separately. One more thing -- my invoice shows I was charged $45 but the website says $39.99 for this stand. Can you check that?
Agent: I understand your concern about the pricing discrepancy, let me look into that right away.
Agent: I can see here that there was a temporary price increase during a stock shortage, which is why your order shows $45.
Agent: However, since the current listed price is $39.99, I'll go ahead and refund you the $5.01 difference right now.
Customer: Oh awesome, thank you so much!
Agent: You're very welcome! I've just processed that refund, it should reflect in your account within 3-5 business days.
Agent: Is there anything else I can help you with today?
Customer: Actually yes -- I have a second order too, number 91045, a wireless mouse. It arrived but it's not connecting to my laptop at all.
Agent: Sorry to hear that! Let me pull up order 91045 as well, one moment.
Agent: I just wanted to let you know I'm checking the order details now, please bear with me.
Customer: Sure, go ahead.
Agent: Okay, I can see the mouse was delivered on the 20th. Have you tried replacing the batteries?
Customer: Yes, I tried new batteries and it still won't connect.
Agent: Understood. Have you tried holding the connect button on the bottom of the mouse for 5 seconds while it's within 1 meter of your laptop?
Customer: Let me try that... okay I just did that, still nothing.
Agent: I appreciate you trying that. Just to clarify, is the laptop's Bluetooth toggle turned on in settings?
Customer: Yes, Bluetooth is on and I can see other devices, just not the mouse.
Agent: Okay, that does sound like a hardware fault with the mouse itself rather than a pairing issue.
Agent: Since this is a hardware defect and the order is only 5 days old, I can offer you either a full refund or a free replacement unit, whichever you'd prefer.
Customer: I'll take the replacement please, I do like the mouse when it worked in the store.
Agent: Great choice! I'm going to go ahead and process a replacement shipment for order 91045 right now.
Agent: The replacement will ship via GroundExpress and should arrive within 5-7 business days, and you do not need to return the defective unit.
Customer: Perfect, thank you. Also, is there a way to track the replacement separately?
Agent: Yes, once it ships you'll get a new tracking number via email, separate from the original order 91045 tracking.
Customer: Great, one more question. I'm a Prime Plus member -- doesn't that give me expedited shipping for free?
Agent: Let me check your membership status.
Agent: I just wanted to let you know I'm verifying your Prime Plus benefits now, one moment please.
Customer: Take your time.
Agent: I can confirm you are indeed a Prime Plus member, and yes, that includes free expedited shipping on eligible items.
Agent: However, the laptop stand from order 88213 wasn't marked eligible for expedited shipping at checkout, which is why it went via GroundExpress.
Customer: That's annoying, is there a way to fix that for future orders?
Agent: I understand the frustration. Going forward, please make sure to select "Prime Plus Expedited" at checkout, as it's not always applied automatically for all product categories.
Agent: As a goodwill gesture for the inconvenience, I'll also apply a $10 credit to your account for a future order.
Customer: Oh that's really kind, thank you!
Agent: You're very welcome! I've just applied the $10 credit, it should be visible in your account within the hour.
Customer: Awesome. Actually, I do have one more thing -- I never got a confirmation email for order 91045's replacement shipment. Can you resend that?
Agent: Of course, let me resend that confirmation email right now.
Agent: I just wanted to let you know I'm triggering the resend now, please check your inbox in the next few minutes.
Customer: Will do, thanks.
Agent: You should also check your spam folder just in case, as some email providers do filter automated shipping notifications.
Customer: Good tip, will check both. Is there a way to also add my phone number for SMS updates on the replacement mouse shipment?
Agent: Yes, I can add SMS tracking updates for you. Can you confirm the phone number on file ending in 4471 is correct?
Customer: Yes that's correct, please add SMS updates for both the mouse replacement and if there's any change to the laptop stand delivery.
Agent: Understood, I've enabled SMS tracking updates for both order 88213 and the replacement for order 91045.
Agent: You should start receiving text updates on the next status change for either shipment.
Customer: Perfect. And just to double check -- the laptop stand refund is only IF it doesn't arrive by Friday, right? Not an automatic refund now?
Agent: That's correct, the laptop stand order 88213 is currently still in transit and expected within 1-2 business days, so no refund has been issued for that one yet.
Agent: The refund for that one is conditional on it not arriving by Friday as we discussed earlier.
Agent: The $5.01 price discrepancy refund has already been processed separately, and that one is unconditional and already done.
Customer: Got it, that makes sense. Okay I think that covers everything!
Agent: Wonderful! Just to summarize everything we covered today: order 88213 laptop stand is in transit with a conditional refund if not arrived by Friday, order 91045 mouse replacement has been shipped due to hardware defect, you received a $5.01 pricing discrepancy refund which is already processed, a $10 goodwill credit has been applied to your account, and SMS tracking updates are now enabled for both shipments.
Customer: That's a great summary, thank you for all the help today!
Agent: It was my pleasure! Is there absolutely anything else I can help you with before we wrap up?
Customer: No that covers everything, thanks for your help!
Agent: You're welcome! Have a great rest of your day, and again, please reach out if the laptop stand doesn't arrive by Friday for that refund.
Customer: Will do, thanks again!
Agent: Take care!
"""

_LEGACY_SHORT_CHAT = """Customer: Hi, I ordered a laptop stand last week and it still hasn't arrived. Order number is 88213.
Agent: Hello! Thanks for reaching out. Let me look into order 88213 for you right away.
Agent: I just wanted to let you know I'm pulling up your account now, please give me one moment.
Customer: Sure, no problem, take your time.
Agent: Okay I can see the order here. It looks like it shipped on the 14th via GroundExpress.
Customer: It's been 9 days though, that seems really long for ground shipping.
Agent: I understand your frustration, and I apologize for the inconvenience this has caused.
Agent: As I mentioned, it shipped on the 14th, and looking at the tracking, there was a delay at the regional hub.
Customer: Okay, is there any update on when it will actually arrive?
Agent: Just to clarify, the tracking shows it left the regional hub yesterday and is now out for delivery in your area.
Agent: Based on the current tracking status, it should arrive within 1-2 business days.
Customer: Alright, thanks. If it doesn't show up by Friday, can I get a refund instead?
Agent: Absolutely, if it hasn't arrived by Friday, please reach back out and we will process a full refund immediately.
"""

SAMPLE_CODE_QUESTION = "What happens if two concurrent requests try to reserve the same SKU when there's only enough stock for one of them?"

SAMPLE_CHAT_QUESTION = "What did the agent decide about the mouse from order 91045, and what is the total dollar value of goodwill/refund credits applied across this conversation?"
