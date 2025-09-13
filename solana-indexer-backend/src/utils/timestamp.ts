// Function to format timestamp for clickhouse
export const formatTimestampForClickHouse = (isoString: string): string => {
    // Convert ISO string to ClickHouse DateTime64 format
    return isoString.replace("T", " ").replace("Z", "");
  };