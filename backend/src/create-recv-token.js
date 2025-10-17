const {
  Client,
  TokenCreateTransaction,
  TokenType,
  TokenSupplyType,
  Hbar,
  PrivateKey,
} = require("@hashgraph/sdk");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

console.log("🔧 Environment loaded:");
console.log("OPERATOR_ID:", process.env.OPERATOR_ID);
console.log(
  "OPERATOR_KEY:",
  process.env.OPERATOR_KEY ? "✅ Loaded" : "❌ Missing"
);

async function main() {
  // 1. Create client for Hedera Testnet
  const client = Client.forTestnet();

  // 2. Set operator account (who pays for and signs transactions)
  const operatorKey = PrivateKey.fromStringECDSA(process.env.OPERATOR_KEY);
  client.setOperator(process.env.OPERATOR_ID, operatorKey);

  // 3. Set default max transaction fee
  client.setDefaultMaxTransactionFee(new Hbar(100));

  console.log("📝 Creating RECV token...");

  try {
    // Add a small delay to ensure proper timing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 4. Create the token transaction with conservative timing
    const tokenCreateTx = new TokenCreateTransaction()
      .setTokenName("ReceiptoVerse") // Token full name
      .setTokenSymbol("RECV") // Token symbol
      .setTokenType(TokenType.FungibleCommon) // Fungible token (like ERC-20)
      .setDecimals(2) // 2 decimal places
      .setInitialSupply(1000000) // 1M RECV tokens (1,000,000.00 with 2 decimals)
      .setTreasuryAccountId(process.env.OPERATOR_ID) // Treasury holds initial supply
      .setSupplyType(TokenSupplyType.Infinite) // Can mint more tokens later
      .setMaxTransactionFee(new Hbar(50)) // Max fee for this transaction
      .setTransactionValidDuration(180); // 3 minutes validity

    // 5. Execute the transaction
    console.log("⏳ Executing transaction...");
    const txResponse = await tokenCreateTx.execute(client);

    // 6. Get the receipt (proof of execution)
    console.log("📄 Getting receipt...");
    const receipt = await txResponse.getReceipt(client);

    console.log("✅ Token created successfully!");
    console.log("🪙 Token ID:", receipt.tokenId.toString());
    console.log(
      "🔗 View on HashScan:",
      `https://hashscan.io/testnet/token/${receipt.tokenId.toString()}`
    );

    // 7. Close the client connection
    client.close();
  } catch (error) {
    console.error("❌ Error creating token:", error.message);
    if (error.status) {
      console.error("📊 Status code:", error.status.toString());
    }
    client.close();
    process.exit(1);
  }
}

// Run the main function
main().catch((error) => {
  console.error("❌ Unexpected error:", error);
  process.exit(1);
});
