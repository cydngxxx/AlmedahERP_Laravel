var CSRF_TOKEN = $('meta[name="csrf-token"]').attr('content');

/**
 * $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': CSRF_TOKEN,
        }
    });
 */

function addRowbomOperation(){
    if($('#no-data')[0]){
        deleteItemRow($('#no-data').parents('tr'));
    }
    let lastRow = $('#newrouting-input-rows tr:last');
    let nextID = (lastRow.length != 0) ? lastRow.data('id') + 1 : 0;
    $('#newrouting-input-rows').append(
    `
    <tr data-id="${nextID}">
        <td class="text-center">

        <div class="form-check" >
            <input type="checkbox" class="form-check-input">
        </div>
        </td>
        <td id="mr-code-input" class="mr-code-input"><input type="number" value="${nextID}"  name="seq_id" id="seq_id${nextID}" class="form-control" readonly></td>
        <td style="width: 10%;" class="mr-qty-input">
            <input type="text" value=""  name="operation" id="operation${nextID}" class="form-control" list="operations_list" onchange="operationSearch(${nextID});">
        </td>
        <td class="mr-unit-input"><input type="text" value=""  name="workcenter" id="workcenter${nextID}" class="form-control"></td>
        <td class="mr-unit-input"><input type="text" value=""  name="description" id="description${nextID}" class="form-control"></td>
        <td class="mr-unit-input"><input type="number" value=""  name="hour_rate" id="hour_rate${nextID}" class="form-control"></td>
        <td class="mr-unit-input"><input type="number" value=""  name="operation_time" id="operation_time${nextID}" class="form-control"></td>
        <td>
            <a id="" class="btn" data-toggle="modal" data-target="#edit_routing" href="#" role="button">
                <i class="fa fa-edit" aria-hidden="true"></i>
            </a>
            <a id="" class="btn delete-btn" href="#" role="button">
                <i class="fa fa-trash" aria-hidden="true"></i>
            </a>
        </td>
    </tr>`
    );
}

$("#closeOpModal, #operationCross").click(clearOperationFields);

function clearOperationFields() {
    $("#Operation_Name").val(null);
    $("#Default_WorkCenter").val(null);
    $("#Description").html(null);
}

$("#routingsForm").submit(function () {
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': CSRF_TOKEN,
        }
    });
    // create a routing first....
    var routingData = new FormData(this);
    var routingId = "";
    for (var pair of routingData.entries()) {
        console.log(pair[0]+ ', ' + pair[1]);
    }
    $.ajax({
        type: "POST",
        url: $("#routingsForm").attr('action'),
        async: false, //needed for retrieving routing_id from url
        data: routingData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (response) {
            routingId = response.routing_id;
        }
    });
    //routingId = tempId;
    // ..then input the routing operations
    var operationsData;
    operations = $("#newrouting-input-rows tr");
    for(let i=1; i<=operations.length; i++) {
        operationsData = new FormData();
        operationsData.append('seq_id', $(`#seq_id${i}`).val());
        operationsData.append('operation', $(`#operation${i}`).val());
        operationsData.append('routing_id', routingId);
        operationsData.append('hour_rate', $(`#hour_rate${i}`).val());
        operationsData.append('operation_time', $(`#operation_time${i}`).val());
        $.ajax({
            type: "POST",
            url: '/routingoperation',
            data: operationsData,
            cache: false,
            contentType: false,
            processData: false,
            success: function (response) {
                console.log("success");
                RoutingTable();
            }
        });
    }
    return false;

});

$("#routeDelete").click(function () {
    $("#deleteRouting").submit();
});

$("#deleteRouting").submit(function () {
    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': CSRF_TOKEN,
        }
    });
    $.ajax({
        type: "DELETE",
        url: $(this).attr('action'),
        cache: false,
        contentType: false,
        processData: false,
        success: function (response) {
            RoutingTable();
        }
    });
    return false;
});

$("#saveRouting").click(function () {
    $("#routingsForm").submit();
});

$("#saveOperation").click(function() {
    $("#operationForm").submit();
});

$("#operationForm").submit(function () {
    var formData = new FormData(this);
    $.ajax({
        type: $(this).attr('method'),
        url: $(this).attr('action'),
        data: formData,
        cache: false,
        contentType: false,
        processData: false,
        success: function (response) {
            clearOperationFields();
            let dl = $("#operations_list");
            $("#operations_list option").remove();
            let operations = response.operations;
            for(let i = 0; i < operations.length; i++) {
                dl.append(
                    `<option value="${operations[i].operation_id}">${operations[i].operation_name}</option>`
                );
            }
        }
    });
    return false;
});


function operationSearch(id) {
    var field = $(`#operation${id}`);
    $.ajax({
        type: "GET",
        url: `/get-operation/${field.val()}`,
        data: field.val(),
        success: function (response) {
            let operation = response.operation;
            $(`#workcenter${id}`).val(operation.wc_code);
            $(`#description${id}`).val(operation.description);
        }
    });
}


$(document).ready(function() {
    $('.summernote').summernote({
        height: 200
    });
    $('#myTimeline').verticalTimeline({
        startLeft: false,
        alternate: false,
        arrows: false
    });
});
