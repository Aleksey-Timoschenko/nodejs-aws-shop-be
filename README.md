# nodejs-aws-shop-be

## **TASK 3**
Within this task
1. getProdcutsList lambda function was implemented - https://d7km2x2u1j.execute-api.eu-north-1.amazonaws.com/products
2. getProductsById lambda function was implemented - https://d7km2x2u1j.execute-api.eu-north-1.amazonaws.com/products/1 (you can use ids from 1 to 5)
3. FE part was integrated with new endpoints (Link to site - https://d1akx69qkmi8fp.cloudfront.net/) You can also check FE pull request - Update products path nodejs-aws-shop-react#2
4. Swagger documentation was created for Product Service. Inside product-service folder you can find openapi.json file and import it to the swagger editor - https://editor.swagger.io/
5. Lambda handlers were covered by basic UNIT tests
6. Lambda handlers (getProductsList, getProductsById) code was written not in 1 single module (file) and separated in codebase
7. Main error scenarios were handled by API ("Product not found" error). You can test it by using this link https://d7km2x2u1j.execute-api.eu-north-1.amazonaws.com/products/1 without id or with invalid id (more than 5)