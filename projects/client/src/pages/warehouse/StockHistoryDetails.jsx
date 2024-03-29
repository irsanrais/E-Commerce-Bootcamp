import { Select, Button, Card, CardHeader, CardBody, Heading, Stack, StackDivider, Box, Text, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Flex, Spinner } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { AiOutlineArrowUp, AiOutlineArrowDown } from "react-icons/ai";
import ReactPaginate from "react-paginate";

const StockHistory = () => {
  const [warehouseData, setWarehouseData] = useState([]);
  const [month, setMonth] = useState("");
  const [stockQuery, setStockQuery] = useState("");
  const [warehouseQuery, setWarehouseQuery] = useState("");
  const [stockHistories, setStockHistories] = useState([]);
  const [productName, setProductName] = useState("");
  const [page, setPage] = useState(0);
  const [totalPage, setTotalPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const { search } = useLocation();
  const id = search.split("=")[1];

  const getWarehouseData = () => {
    Axios.get(`${process.env.REACT_APP_API_BASE_URL}/warehouses/getAllWarehouse`)
      .then((response) => {
        setWarehouseData(response.data);
      })
      .catch((err) => console.log(err));
  };

  const getProductsData = () => {
    Axios.get(`${process.env.REACT_APP_API_BASE_URL}/histories/getAllProducts?id=${id}`)
      .then((response) => {
        setProductName(response.data[0].name);
      })
      .catch((err) => console.log(err));
  };

  let token = localStorage.getItem("token");
  const historyDetails = () => {
    Axios.get(`${process.env.REACT_APP_API_BASE_URL}/histories/getHistoryDetails?products_id=${id}&stockQuery=${stockQuery}&warehouseQuery=${warehouseQuery}&month=${month}&page=${page}`, {
      headers: { Authorization: token },
    })
      .then((response) => {
        setStockHistories(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.log(error.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    getProductsData();
    getWarehouseData();
    historyDetails();
  }, [stockQuery, warehouseQuery, month, page]);

  const showStockHistories = () => {
    return stockHistories.map((value) => {
      return (
        <Tr key={value.id}>
          <Td>{value.time}</Td>
          <Td>{value.description}</Td>
          <Td>
            <Flex>
              <AiOutlineArrowDown style={{ marginTop: 1, marginRight: 10 }} />
              {value.stockIn}
            </Flex>
          </Td>
          <Td>
            <Flex>
              <AiOutlineArrowUp style={{ marginTop: 1, marginRight: 10 }} />
              {value.stockOut}
            </Flex>
          </Td>
        </Tr>
      );
    });
  };

  const handlePageClick = (data) => {
    setPage(data.selected);
  };

  return (
    <>
      <Flex flexDirection="row">
        <Flex flexDirection="column" minWidth="fit-content" alignItems="center" gap="5" paddingX={5}>
          <div style={{ marginRight: "50px" }}>
            <Box>
              <Text fontSize="2xl" my={12}>
                Product: {productName}
              </Text>
              {loading ? (
                <Spinner />
              ) : stockHistories.length !== 0 && !loading ? (
                <TableContainer>
                  <Table variant="striped" size="md">
                    <Thead>
                      <Tr>
                        <Th>Date & Time</Th>
                        <Th>Description</Th>
                        <Th>Stock In</Th>
                        <Th>Stock Out</Th>
                      </Tr>
                    </Thead>
                    <Tbody>{showStockHistories()}</Tbody>
                  </Table>
                </TableContainer>
              ) : (
                <Text as="b" fontSize="xl">
                  There was no stock changes.<br></br>You may check the filter that you are using.
                </Text>
              )}
            </Box>
          </div>
          <div id="pagination" className="mt-5 flex items-center justify-center">
            <Button onClick={() => navigate("/warehouse/history")}>Back to stock history</Button>
            <ReactPaginate
              previousLabel={"< Previous"}
              nextLabel={"Next >"}
              breakLabel={"..."}
              pageCount={totalPage}
              marginPagesDisplayed={2}
              pageRangeDisplayed={2}
              onPageChange={handlePageClick}
              containerClassName={"flex"}
              pageClassName={"page-item"}
              pageLinkClassName={"mx-2 bg-gray-200 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"}
              previousLinkClassName={"mx-2 bg-gray-200 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"}
              nextLinkClassName={"mx-2 bg-gray-200 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"}
            />
          </div>
        </Flex>
        <div
          style={{
            position: "sticky",
            top: 100,
            left: 100,
            display: "inline-block",
          }}
        >
          <Card mt="12" mr="12">
            <CardHeader>
              <Heading size="md" textTransform="uppercase">
                Stock History Details
              </Heading>
              <Text fontSize="md" pt="4">
                See a detailed analysis of all your product stocks.
              </Text>
              <Text fontSize="md">View a history of your products over the last month.</Text>
            </CardHeader>

            <CardBody>
              <Stack divider={<StackDivider />} spacing="4">
                <Box>
                  <Text pt="2" fontSize="md">
                    Filter data by:
                  </Text>
                  <Select placeholder="Stock in / stock out" onChange={(element) => setStockQuery(element.target.value)}>
                    <option value="stockIn">Stock In</option>
                    <option value="stockOut">Stock Out</option>
                  </Select>

                  <Text pt="2" fontSize="md">
                    Warehouse location:
                  </Text>

                  <Select placeholder="Select warehouse" onChange={(element) => setWarehouseQuery(element.target.value)}>
                    {warehouseData.map((value) => {
                      return <option value={value.name}>{value.name}</option>;
                    })}
                  </Select>

                  <Text pt="2" fontSize="md">
                    Month:
                  </Text>
                  <Select placeholder="Select month" onChange={(element) => setMonth(element.target.value)}>
                    <option value={1}>January</option>;<option value={2}>February</option>;<option value={3}>March</option>;<option value={4}>April</option>;<option value={5}>May</option>;<option value={6}>June</option>;
                    <option value={7}>July</option>;<option value={8}>August</option>;<option value={9}>September</option>;<option value={10}>October</option>;<option value={11}>November</option>;<option value={12}>December</option>;
                  </Select>
                </Box>
              </Stack>
            </CardBody>
          </Card>
        </div>
      </Flex>
    </>
  );
};

export default StockHistory;
