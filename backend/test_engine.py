from engine import chunk_code, compress, count_tokens
from sample_data import SAMPLE_CODE, SAMPLE_CHAT, SAMPLE_CHAT_QUESTION

def test_class_methods_stay_together():
    chunks = chunk_code(SAMPLE_CODE)
    inventory = next(c for c in chunks if c.text.startswith("class InventoryService"))
    assert "def reserve_stock" in inventory.text
    assert "def get_stock_level" in inventory.text

def test_compression_is_smaller():
    result = compress(SAMPLE_CHAT, SAMPLE_CHAT_QUESTION, "chat")
    assert result.compressed_tokens <= count_tokens(SAMPLE_CHAT)
    assert result.total_chunks > 0
    assert result.compressed_text
