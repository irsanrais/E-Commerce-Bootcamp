import axios from "axios";
import Carousel from "nuka-carousel";
import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import ReactPaginate from "react-paginate";
import Carousel1 from "../assets/carousel/carousel1.jpg";
import Carousel2 from "../assets/carousel/carousel2.jpg";
import Carousel3 from "../assets/carousel/carousel3.jpg";
import Carousel4 from "../assets/carousel/carousel4.jpg";
import CategoryCard from "../components/CategoryCard";
import { ProductCard } from "../components/ProductCard";
import ScrollToTopButton from "../components/ScrollToTopButton";
import { Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Box } from "@chakra-ui/react";

export default function Home() {
  const [products, setProducts] = useState([]);
  const queryParams = new URLSearchParams(window.location.search);
  const search = queryParams.get("search");
  const [color, setColor] = useState("");
  const [category, setCategory] = useState();
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [pageCount, setPageCount] = useState(0);
  const [limit] = useState(12);
  const [offset, setOffset] = useState(0);
  const radioColor = ["Black", "Blue", "Brown", "Gray", "Green", "Maroon", "Navy", "Orange", "Pink", "Purple", "Red", "Turquoise", "White"];

  const getCategory = (category_id) => {
    setCategory(category_id);
    setOffset(0);
  };

  const fetchProducts = async () => {
    try {
      const productsData = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/products/`, {
        params: {
          color,
          search,
          category,
          minPrice,
          maxPrice,
          sortBy,
          sortOrder,
          limit,
          offset,
        },
      });
      setProducts(productsData?.data?.data?.rows);
      setPageCount(Math.ceil(productsData?.data?.data?.count / limit));
    } catch (error) {
      toast.error(error?.response?.data?.message || error?.message);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, color, category, minPrice, maxPrice, sortBy, sortOrder, limit, offset]);

  return (
    <div className="flex flex-col justify-between w-full">
      <div className="p-2 md:p-4">
        <Carousel
          wrapAround={true}
          autoplay={true}
          pauseOnHover={true}
          defaultControlsConfig={{
            nextButtonText: ">",
            prevButtonText: "<",
            pagingDotsStyle: {
              fill: "white",
              margin: "0 15px 0 15px",
            },
          }}
        >
          <img src={Carousel1} alt="carousel-1" className="w-full rounded-none" />
          <img src={Carousel2} alt="carousel-2" className="w-full rounded-none" />
          <img src={Carousel3} alt="carousel-3" className="w-full rounded-none" />
          <img src={Carousel4} alt="carousel-4" className="w-full rounded-none" />
        </Carousel>
      </div>

      <CategoryCard func={getCategory} />

      <div className="flex justify-end items-center mt-4 px-4 text-md">
        <label htmlFor="sort" className="font-[Oswald] mr-1 text-md">
          Sort by :
        </label>
        <select
          id="sort"
          value={`${sortBy}-${sortOrder}`}
          onChange={(e) => {
            const [newSortBy, newSortOrder] = e.target.value.split("-");
            setSortBy(newSortBy);
            setSortOrder(newSortOrder);
          }}
          className="px-2 py-1 border border-gray-500 rounded-none font-[Roboto] text-md"
        >
          <option value="name-asc">Name A-Z</option>
          <option value="name-desc">Name Z-A</option>
          <option value="price-asc">Lower Price</option>
          <option value="price-desc">Higher Price</option>
        </select>
      </div>
      <div className="grid md:grid-cols-4 grid-cols-1">
        <div className="mx-2 my-4 p-2 border-2 border-gray-200 dark:bg-gray-800 dark:text-white shadow rounded-none">
          <p className="text-md font-[Oswald]">Filter</p>
          <hr className="border-2 my-2" />
          <p className="text-left font-[Oswald]">Price</p>
          <div className="py-4">
            <div className="flex text-md font-[Roboto]">
              <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-none dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">Rp</span>
              <input
                onBlur={(event) => setMinPrice(event.target.value)}
                type="text"
                className="rounded-none rounded-r-none bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Min price"
              />
            </div>
          </div>
          <div>
            <div className="flex text-md font-[Roboto]">
              <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-r-0 border-gray-300 rounded-none dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">Rp</span>
              <input
                onBlur={(event) => setMaxPrice(event.target.value)}
                type="text"
                className="rounded-none rounded-r-none bg-gray-50 border text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm border-gray-300 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Max price"
              />
            </div>
          </div>
          <hr className="border-2 mt-4 mb-2" />
          <Accordion allowToggle>
            <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box as="span" flex="1" textAlign="left">
                    <p className="text-left font-[Oswald] mb-2">Color</p>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel pb={4}>
                <div className="flex items-center mb-2">
                  <input
                    onChange={(event) => setColor(event.target.value)}
                    id="All"
                    type="radio"
                    value=""
                    name="color"
                    className="font-[Roboto] w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <label htmlFor="default-radio-1" className="ml-2 text-sm text-gray-900 dark:text-gray-300">
                    All
                  </label>
                </div>
                {radioColor.map((color, index) => {
                  return (
                    <div key={index} className="flex items-center mb-2">
                      <input
                        onChange={(event) => setColor(event.target.value)}
                        id={color}
                        type="radio"
                        value={color}
                        name="color"
                        className="font-[Roboto] w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label htmlFor="default-radio-1" className="font-[Roboto] ml-2 text-sm text-gray-900 dark:text-gray-300">
                        {color}
                      </label>
                    </div>
                  );
                })}
              </AccordionPanel>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="my-4 px-2 grid col-span-3 md:grid-cols-4 grid-cols-2 gap-4 ">
          <ProductCard products={products} func={getCategory} />
          <div className="grid md:col-span-4 col-span-2 place-items-center font-[Oswald] ">
            <ReactPaginate
              previousLabel="<"
              nextLabel=">"
              breakLabel="..."
              breakClassName="md:mx-2 md:bg-gray-200 md:hover:bg-gray-400 md:text-gray-800  md:-my-[0.42rem] md:pt-2 md:px-3.5 md:rounded-none"
              pageRangeDisplayed={0}
              marginPagesDisplayed={1}
              pageCount={pageCount}
              onPageChange={({ selected }) => setOffset(selected * limit)}
              containerClassName="flex"
              pageLinkClassName="mx-2 bg-gray-200 hover:bg-gray-400 text-gray-600 text-md py-2 px-4 rounded-none"
              previousLinkClassName="mx-2 bg-gray-200 hover:bg-gray-400 text-gray-600 font-bold py-2 px-4 rounded-none"
              nextLinkClassName="mx-2 bg-gray-200 hover:bg-gray-400 text-gray-600 font-bold py-2 px-4 rounded-none"
              activeLinkClassName="mx-2 bg-blue-500 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded"
              disabledLinkClassName="mx-2 bg-gray-300 text-gray-500 font-bold py-2 px-4 rounded"
            />
          </div>
        </div>
      </div>
      <ScrollToTopButton />
      <Toaster />
    </div>
  );
}
